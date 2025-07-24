import { getAuth } from "@clerk/react-router/ssr.server";
import Hero from "~/components/homepage/hero";
import HowItWorks from "~/components/homepage/how-it-works";
import WhyItWorks from "~/components/homepage/why-it-works";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  const title = "BetOnYou - Put Your Money Where Your Goals Are";
  const description =
    "Join the waitlist for the app that rewards your discipline—or donates your money if you don't.";
  const keywords = "Goals, Accountability, Habits, Motivation, Charity, Discipline";
  const siteUrl = "https://www.reactstarter.xyz/";
  const imageUrl =
    "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/rsk-image-FcUcfBMBgsjNLo99j3NhKV64GT2bQl.png";

  return [
    { title },
    {
      name: "description",
      content: description,
    },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:url", content: siteUrl },
    { property: "og:site_name", content: "BetOnYou" },
    { property: "og:image", content: imageUrl },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    {
      name: "twitter:description",
      content: description,
    },
    { name: "twitter:image", content: imageUrl },
    {
      name: "keywords",
      content: keywords,
    },
    { name: "author", content: "BetOnYou Team" },
    { name: "favicon", content: imageUrl },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  return {
    isSignedIn: !!userId,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Hero loaderData={loaderData} />
      <HowItWorks />
      <WhyItWorks />
    </>
  );
}
