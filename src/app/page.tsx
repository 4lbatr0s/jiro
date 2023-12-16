import Image from "next/image";
import MaxWidthWrapper from "./components/MaxWidthWrapper";
import constants from "./lib/constants";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
export default function Home() {
  return (
    <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
      <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
        <p className="text-sm font-semibold text-gray-700">
          {`${constants.appConstants.appName} is now public!`}
        </p>
      </div>
      <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
        Converse with your <span className="text-orange-600">documents</span>{" "}
        effortlessly!
      </h1>
      <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
        Unleash the Power of jiro: Conversations with Your PDFs! Effortlessly
        upload your file and dive into Q&A sessions instantly.
      </p>
      <Link className={buttonVariants({
        size:'lg',
        className:'mt-5'
      })} href="/dashboard" target="_blank">
        Start Now <ArrowRight className="ml-2 h-5 w-5"/>
      </Link>
    </MaxWidthWrapper>
  );
}
