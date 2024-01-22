import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="flex flex-col h-full w-full">
      <div className="flex justify-between p-4">
        <div />
        <div className="flex gap-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
            Import
        </button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
            Export
        </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-4">
        <img
          alt="Gallery Image 1"
          className="aspect-square object-cover border border-gray-200 w-full rounded-lg overflow-hidden dark:border-gray-800"
          height="200"
          src="/placeholder.svg"
          width="200"
        />
        <img
          alt="Gallery Image 2"
          className="aspect-square object-cover border border-gray-200 w-full rounded-lg overflow-hidden dark:border-gray-800"
          height="200"
          src="/placeholder.svg"
          width="200"
        />
        <img
          alt="Gallery Image 3"
          className="aspect-square object-cover border border-gray-200 w-full rounded-lg overflow-hidden dark:border-gray-800"
          height="200"
          src="/placeholder.svg"
          width="200"
        />
        <img
          alt="Gallery Image 4"
          className="aspect-square object-cover border border-gray-200 w-full rounded-lg overflow-hidden dark:border-gray-800"
          height="200"
          src="/placeholder.svg"
          width="200"
        />
        <img
          alt="Gallery Image 5"
          className="aspect-square object-cover border border-gray-200 w-full rounded-lg overflow-hidden dark:border-gray-800"
          height="200"
          src="/placeholder.svg"
          width="200"
        />
        <img
          alt="Gallery Image 6"
          className="aspect-square object-cover border border-gray-200 w-full rounded-lg overflow-hidden dark:border-gray-800"
          height="200"
          src="/placeholder.svg"
          width="200"
        />
      </div>
    </div>
    </main>
  );
}
