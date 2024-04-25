import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const WalletButtonDynamic = dynamic(
    async () =>
      (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
  );
  return (
    <main className="min-h-screen text-gray-200 ">
      <nav className="flex justify-between w-full mb-16 pt-3 font-inter">
        <h1 className="logo_gradient font-bold text-3xl">DogeMint</h1>
        <WalletButtonDynamic />
      </nav>
      <section className="w-full flex items-center flex-col">
        <h1 className="text-center text-white font-bold">Mint in Minute</h1>
        <br className="max-md:hidden" />
        <span className="text-2xl font-extrabold orange_gradient text-center sm:text-4xl">
          Create and Mint Your Unique Digital Artwork
        </span>
      </section>
      {/* Form Mata data Collection */}
      <div>
        <div className="glassmorphism max-w-sm mx-auto my-4 flex justify-center">
          <form className=" mx-auto">
            <h1 className="text-center text-2xl font-bold  my-4">
              NFT Details
            </h1>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray200">
                Upload Image
              </label>
              <input
                type="file"
                id="fileUpload"
                className="bg-gray-500 border-gray-300 text-gray-200 text-sm rounded-lg lock w-full p-2.5 "
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray200">
                NFT Name
              </label>
              <input
                type="text"
                className="bg-gray-500 border-gray-300 text-gray-200 text-sm rounded-lg lock w-full p-2.5 focus:ring-blue-500 focus:border-red-500 "
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray200">
                About NFT
              </label>
              <input
                type="text"
                className="bg-gray-500 border-gray-300 text-gray-200 text-sm rounded-lg lock w-full p-2.5 focus:ring-blue-500 focus:border-red-500 "
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray200">
                Value
              </label>
              <input
                type="text"
                className="bg-gray-500 border-gray-300 text-gray-200 text-sm rounded-lg lock w-full p-2.5 focus:ring-blue-500 focus:border-red-500 "
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray200">
                Symbol
              </label>
              <input
                type="text"
                className="bg-gray-500 border-gray-300 text-gray-200 text-sm rounded-lg lock w-full p-2.5 focus:ring-blue-500 focus:border-red-500 "
              />
            </div>
            <div className="mb-5">
              <button className="w-full bg-gradient-to-r from-purple-500 via-blue-600 to-green-500 py-2 rounded-lg font-bold text-xl hover:bg-gradient-to-r hover:from-green-500 hover:via-blue-600 hover:to-purple-500">
                Create NFT
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
