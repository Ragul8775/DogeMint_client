import {
  Metaplex,
  walletAdapterIdentity,
  bundlrStorage,
  toMetaplexFile,
  keypairIdentity,
} from "@metaplex-foundation/js";

import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import NotificationComponent from "@/components/Notification";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    value: "",
    symbol: "",
  });
  console.log(formData);

  const [userUpImage, SetUserUpImage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [metaplex, setMetaplex] = useState(null);
  const [metaImageUri, setMetaImageUri] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [metaData, setMetaData] = useState("");
  console.log(userUpImage);
  console.log(metaImageUri);
  const rpcEndPoint =
    "https://tiniest-fluent-water.solana-devnet.quiknode.pro/428929c7ca1602c0468b72fd69f26e28a5dc65f6/";
  const wallet = useWallet();
  const METAPLEX = useMemo(() => {
    const CONNECTION = new Connection(rpcEndPoint);
    const metaplexInstance = Metaplex.make(CONNECTION)
      .use(keypairIdentity(wallet))
      .use(
        bundlrStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: rpcEndPoint,
          timeout: 60000,
        })
      );

    if (wallet.connected) {
      metaplexInstance.use(walletAdapterIdentity(wallet));
    }

    return metaplexInstance;
  }, [wallet]);

  useEffect(() => {
    setPublicKey(METAPLEX.identity().publicKey);
  }, [METAPLEX]);

  const WalletButtonDynamic = dynamic(
    async () =>
      (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
  );

  const handleImageUpload = (e) => {
    e.preventDefault();
    const Image = e.target.files[0];
    SetUserUpImage(Image);
  };

  const imageUriMetaplex = async (file) => {
    console.log(file);
    if (!METAPLEX) {
      console.error("METAPLEX is not initialized");
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageUintBuffer = new Uint8Array(e.target.result);
          console.log(imageUintBuffer, file.name);
          const imageMetaplex = toMetaplexFile(imageUintBuffer, file.name);
          const imageUri = await METAPLEX.storage().upload(imageMetaplex);
          setMetaImageUri(imageUri); // Assume setMetaImageUri is defined to update state
          console.log("Metadata Image:", imageUri);
          setNotification({
            // Assume setNotification is defined to update state
            message: "Image Uri Generated",
            type: "success",
          });
        } catch (uploadError) {
          setNotification({
            // Assume setNotification is defined to update state
            message: `Failed to Generate Image: ${uploadError.message}`,
            type: "error",
          });
          console.error("Error uploading image:", uploadError);
        }
      };
      reader.onerror = (readError) => {
        setNotification({
          // Assume setNotification is defined to update state
          message: `Error reading file: ${readError.message}`,
          type: "error",
        });
        console.error("Error reading file:", readError);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Handle Image Upload Error:", error);
    }
  };

  const createMetadata = async (metaImage, imageType) => {
    try {
      const metadataMetaplex = await METAPLEX.nfts().uploadMetadata({
        metaImage,

        name: formData.name,
        about: formData.about,
        properties: {
          files: [
            {
              type: imageType,
              uri: metaImage,
            },
          ],
        },
      });
      console.log("MetadataUri:", metadataMetaplex);
      setMetaData(metadataMetaplex);
      setNotification({
        message: "Metadata Generated",
        type: "success",
      });
      return metadataMetaplex;
    } catch (error) {
      setNotification({
        message: `Failed to Generate Image: ${error.message}`,
        type: "error",
      });
      console.log("Error:", error);
      throw error;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("formSubmitted");
    if (!wallet.connected) {
      setNotification({
        message: `Wallet not Connected: ${error.message}`,
        type: "error",
      });
      return;
    }
    console.log("wallet ensured");
    if (!userUpImage) {
      setNotification({
        message: `file is not selected: ${error.message}`,
        type: "error",
      });
      return;
    }
    console.log("Image Ensured");
    try {
      const metaImage = await imageUriMetaplex(userUpImage);
      console.log("ImageUri:", metaImage);
      /* console.log(metaImage);
      const imageType = "image/png";
   /*    const metadataUri = await createMetadata({
        metaImage,
        imageType,
      }); */
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <main className="min-h-screen text-gray-200 ">
      <nav className="flex justify-between w-full mb-16 pt-3 font-inter">
        <h1 className="logo_gradient font-bold text-3xl">DogeMint</h1>
        <WalletButtonDynamic />
      </nav>
      <NotificationComponent showNotification={notification} />
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
          <form className=" mx-auto" onSubmit={handleSubmit}>
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
                onChange={(e) => handleImageUpload(e)}
                className="bg-gray-500 border-gray-300 text-gray-200 text-sm rounded-lg lock w-full p-2.5 "
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray200">
                NFT Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-gray-500 border-gray-300 text-gray-200 text-sm rounded-lg lock w-full p-2.5 focus:ring-blue-500 focus:border-red-500 "
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray200">
                About NFT
              </label>
              <input
                type="text"
                value={formData.about}
                onChange={(e) =>
                  setFormData({ ...formData, about: e.target.value })
                }
                className="bg-gray-500 border-gray-300 text-gray-200 text-sm rounded-lg lock w-full p-2.5 focus:ring-blue-500 focus:border-red-500 "
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray200">
                Value
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                className="bg-gray-500 border-gray-300 text-gray-200 text-sm rounded-lg lock w-full p-2.5 focus:ring-blue-500 focus:border-red-500 "
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray200">
                Symbol
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) =>
                  setFormData({ ...formData, symbol: e.target.value })
                }
                className="bg-gray-500 border-gray-300 text-gray-200 text-sm rounded-lg lock w-full p-2.5 focus:ring-blue-500 focus:border-red-500 "
              />
            </div>
            <div className="mb-5">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 via-blue-600 to-green-500 py-2 rounded-lg font-bold text-xl hover:bg-gradient-to-r hover:from-green-500 hover:via-blue-600 hover:to-purple-500"
              >
                Create NFT
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
