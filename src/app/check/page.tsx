import CheckFunnel from "@/components/check/CheckFunnel";

type CheckPageProps = {
  searchParams: Promise<{ region?: string | string[] }>;
};

export default async function CheckPage({ searchParams }: CheckPageProps) {
  const params = await searchParams;
  const region = Array.isArray(params.region) ? params.region[0] : params.region;

  return <CheckFunnel initialRegion={region ?? ""} />;
}
