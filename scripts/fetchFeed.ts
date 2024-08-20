import { backOff } from "exponential-backoff";
import path from "path";
import _ from "lodash";
import { feeds } from "../src/config/common";
import { downloadFeed } from "./utils";

console.log({ feeds });

let news: any = [];

for (let i = 0; i < feeds.length; i++) {
  try {
    const resp = await backOff(() =>
      downloadFeed(feeds[i].url, feeds[i].title)
    );
    news = [...news, ...resp];
  } catch (e) {
    console.log(e);
  }
}

const filepath = path.resolve(
  __dirname,
  `../public/data/feeds/all.json`,
);

const sortednews = _.orderBy(news, ["timestamp"], ["desc"]);
console.log({ filepath });
await Bun.write(filepath, JSON.stringify(sortednews));
// exponential-backoff
// https://superchargejs.com/docs/3.x/promise-pool
