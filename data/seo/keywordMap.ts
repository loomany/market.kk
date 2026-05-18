import { blogTopics } from "./blogTopics";

export type KeywordMapRecord = {
  id: string;
  cluster: string;
  primaryKeyword: {
    ru: string;
    en: string;
  };
  secondaryKeywords: {
    ru: string[];
    en: string[];
  };
  longTailKeywords: {
    ru: string[];
    en: string[];
  };
  questionKeywords: {
    ru: string[];
    en: string[];
  };
  commercialModifiers: string[];
  platformModifiers: string[];
  localeSpecificModifiers: string[];
  intent: string;
  funnelStage: "TOFU" | "MOFU" | "BOFU";
  priority: "P0" | "P1" | "P2";
  targetAudience: string[];
  relatedPlatforms: string[];
  relatedUseCases: string[];
  recommendedPageType:
    | "blog"
    | "landing/use-case page"
    | "platform page"
    | "FAQ section"
    | "comparison page";
  indexPolicy: "index_when_content_ready" | "index" | "noindex" | "draft";
  notes: string;
};

function recommendedPageType(topic: (typeof blogTopics)[number]): KeywordMapRecord["recommendedPageType"] {
  if (topic.targetIntent === "platform") return "platform page";
  if (topic.targetIntent === "comparison") return "comparison page";
  if (topic.relatedUseCases.length > 0 && topic.priority === "P0") {
    return topic.targetIntent === "commercial" ? "landing/use-case page" : "blog";
  }
  return "blog";
}

function funnelStage(intent: string): KeywordMapRecord["funnelStage"] {
  if (intent === "commercial" || intent === "platform") return "BOFU";
  if (intent === "comparison" || intent === "how-to") return "MOFU";
  return "TOFU";
}

export const keywordMap: KeywordMapRecord[] = blogTopics.map((topic) => ({
  id: topic.id.replace("blog", "keyword"),
  cluster: topic.cluster,
  primaryKeyword: {
    ru: topic.primaryKeyword.ru ?? "",
    en: topic.primaryKeyword.en ?? "",
  },
  secondaryKeywords: {
    ru: topic.secondaryKeywords.ru ?? [],
    en: topic.secondaryKeywords.en ?? [],
  },
  longTailKeywords: {
    ru: topic.longTailKeywords.ru ?? [],
    en: topic.longTailKeywords.en ?? [],
  },
  questionKeywords: {
    ru: topic.questionKeywords.ru ?? [],
    en: topic.questionKeywords.en ?? [],
  },
  commercialModifiers: ["AI", "generator", "studio", "online", "for sellers"],
  platformModifiers: topic.relatedPlatforms,
  localeSpecificModifiers: ["RU/CIS", "global EN", "manual validation required"],
  intent: topic.targetIntent,
  funnelStage: funnelStage(topic.targetIntent),
  priority: topic.priority,
  targetAudience: topic.targetAudience,
  relatedPlatforms: topic.relatedPlatforms,
  relatedUseCases: topic.relatedUseCases,
  recommendedPageType: recommendedPageType(topic),
  indexPolicy:
    topic.status.ru === "published" || topic.status.en === "published"
      ? "index"
      : "index_when_content_ready",
  notes:
    "Seed keyword cluster. Validate volume and SERP intent in Google Keyword Planner, Yandex Wordstat, and Bing Webmaster Tools before publishing additional locales.",
}));
