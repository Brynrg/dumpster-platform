import Head from "next/head";
import { buildCanonical } from "@/lib/seo";

type CanonicalProps = {
  pathname: string;
};

export default async function Canonical({ pathname }: CanonicalProps) {
  const href = await buildCanonical(pathname);

  return (
    <Head>
      <link rel="canonical" href={href} />
    </Head>
  );
}
