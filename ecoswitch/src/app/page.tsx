import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-3 row-start-2 items-center sm:items-start mb-2">
        <Image
          src="/ecoswitch.svg"
          alt="Next.js logo"
          width={250}
          height={45}
          priority
        />
          <div className="font-[family-name:var(--font-geist-mono)] mb-2">
            click below to get started.
          </div>

        <div className="flex items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center bg-foreground text-background gap-2.5 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-20 sm:px-5"
            href="./scanner"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            begin scanning for items.
          </a>

        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-5"
          href="https://devpost.com/software/ecoswitch"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            className="dark:invert"
            src="/devpost.svg"
            alt="devpost icon"
            width={16}
            height={16}
          />
          Devpost
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/emma-x1/ctrl-hack-del"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            className="dark:invert" 
            src="/github.svg"
            alt="github icon"
            width={16}
            height={16}
          />
          Github
        </a>
      </footer>
    </div>
  );
}
