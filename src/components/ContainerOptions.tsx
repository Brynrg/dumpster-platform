import Link from "next/link";

export type ContainerOption = {
  title: string;
  detail: string;
};

type ContainerOptionsProps = {
  options: ContainerOption[];
};

export default function ContainerOptions({ options }: ContainerOptionsProps) {
  return (
    <>
      {options.map((option) => (
        <article
          key={option.title}
          className="rounded-lg border border-black/10 p-4 dark:border-white/15"
        >
          <h3 className="font-medium">{option.title}</h3>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">
            {option.detail}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link href="/check" className="underline underline-offset-4">
              Check Availability
            </Link>
            <Link href="/service-areas" className="underline underline-offset-4">
              See Service Areas
            </Link>
          </div>
        </article>
      ))}
    </>
  );
}
