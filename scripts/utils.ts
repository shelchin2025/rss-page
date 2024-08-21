import Parser from "rss-parser";
import convert from "xml-js";
import iconv from "iconv-lite";
import dayjs from "dayjs";
import path from "path";

// @ts-ignore
import Buffer from "buffer-shims";

import { md5 } from "hash-wasm";

export function extractEncoding(xmlString: string) {
  // 使用正则表达式来查找encoding属性
  const encodingMatch = xmlString.match(/encoding="([^"]*)"/i);
  if (encodingMatch && encodingMatch[1]) {
    // 如果找到了匹配项，返回encoding的值
    return encodingMatch[1];
  } else {
    // 如果没有找到匹配项，返回未定义
    return undefined;
  }
}
export const downloadFeed = async (feedUrl: string, feedTitle: string) => {
  const parser = new Parser();
  const resp = await fetch(feedUrl);
  const buffer = await resp.arrayBuffer();
  const utf8String = iconv.decode(Buffer.from(buffer), "utf8");
  const encodingType = extractEncoding(utf8String);
  const decoded = iconv.decode(Buffer.from(buffer), encodingType ?? "utf8");
  const feed = await parser.parseString(decoded);

  const entries = feed.items.map((item) => {
    return {
      "feedUrl": feedUrl,
      "feedTitle": feedTitle,
      "title": item.title,
      "link": item.link,
      "author": item.author ?? item.creator,
      "rawPubDate": item.pubDate,
      "timestamp": dayjs(item.pubDate).unix(),
      // "summary": item.summary ?? (item.contentSnippet ?? item.content),
    };
  });

  //   console.log(entries);

  const filename = await md5(feedUrl);

  const filepath = path.resolve(
    __dirname,
    `../src/content/feeds/${filename}.json`,
  );

  console.log({ filepath });
  await Bun.write(
    filepath,
    JSON.stringify({
      collection: feedTitle,
      entries,
    }),
  );
  return entries;
  // console.log(feed)
};
