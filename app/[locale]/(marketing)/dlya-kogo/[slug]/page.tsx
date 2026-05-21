import { createAudienceDetailRoute } from "@/lib/seo/audienceDetailRoute";

const route = createAudienceDetailRoute("dlya-kogo");

export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.default;
