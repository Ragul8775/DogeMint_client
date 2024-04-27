import {
  Metaplex,
  walletAdapterIdentity,
  bundlrStorage,
  toMetaplexFile,
  keypairIdentity,
} from "@metaplex-foundation/js";
import { CirclesWithBar, DNA ,Grid} from 'react-loader-spinner'
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import NotificationComponent from "@/components/Notification";
import Link from "next/link";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    value: "",
    symbol: "",
  });
  
  const crypto = require('crypto');

  const [userUpImage, SetUserUpImage] = useState(null);
  const [notification, setNotification] = useState(null);
 
  const [metaImageUri, setMetaImageUri] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [metaData, setMetaData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const[imageLoading,setImageLoading] = useState(false);
  const [metadataLoading, setMetaDataLoading] = useState(false);
  const [nftLoading, setNftMintLoading] = useState(false);
  const[explorerData, setExplorerData] = useState("")
 console.log(metaImageUri)
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
  
    if (!METAPLEX) {
      console.error("METAPLEX is not initialized");
      return;
    }
    return new Promise((resolve,reject)=>{
      const reader = new FileReader();
      try {
        reader.onload = async (e) => {
          try {
            setImageLoading(true)
            const imageUintBuffer = new Uint8Array(e.target.result);
            
            const imageMetaplex = toMetaplexFile(imageUintBuffer, file.name);
            const imageUri = await METAPLEX.storage().upload(imageMetaplex);
            setMetaImageUri(imageUri); 
            
            setNotification({
             
              message: "Image Uri Generated",
              type: "success",
            });
            resolve(imageUri)
            setImageLoading(false)
          } catch (uploadError) {
            setNotification({
             
              message: `Failed to Generate Image: ${uploadError.message}`,
              type: "error",
            });
            console.error("Error uploading image:", uploadError);
            reject(uploadError);
            setImageLoading(false)

          }
        };
        reader.onerror = (readError) => {
          setNotification({
          
            message: `Error reading file: ${readError.message}`,
            type: "error",
          });
          console.error("Error reading file:", readError);
        };
        reader.readAsArrayBuffer(file);
        setImageLoading(false)

      } catch (error) {
        console.error("Handle Image Upload Error:", error);
        reject(error);
      }
    })
   
  };
  function generateTokenId(length = 16) {
    return crypto.randomBytes(length).toString('hex');
  }
  const createMetadata = async (
    imageUri,
    imageType,
    name,
    about,
    tokenId,
    attributes
   ) => {
    try {
      if (!imageUri) {
        console.error("metaImage is undefined or null");
        return; 
      }
      setMetaDataLoading(true)      
      const metadataMetaplex = await METAPLEX.nfts().uploadMetadata({
        name: name,
        about: about,
        image: imageUri,
        tokenId:tokenId,
        attributes:attributes,
        properties: {
          files: [
            {
              type: imageType,
              uri: imageUri,
            },
          ],
        },
      });
      
      setMetaData(metadataMetaplex.uri);
      setNotification({
        message: "Metadata Generated",
        type: "success",
      });
      setMetaDataLoading(false)      
      return metadataMetaplex;

    } catch (error) {
      setNotification({
        message: `Failed to Generate Image: ${error.message}`,
        type: "error",
      });
      setMetaDataLoading(false)      

      console.log("Error:", error);
      throw error;
    }
  };
  async function prepareMint(metaUri, name, symbol, sellerFee, creators) {
    const headers = {
        'Content-Type': 'application/json'
    };
     setNftMintLoading(true);
    const body = JSON.stringify({
        metaUri,    // Ensure variable names match those expected by the server
        name,
        symbol,
        sellerFee,
        creators   // This should be an array of creators, make sure it is correctly structured
    });
    console.log(body);
    try {
        const response = await fetch('http://localhost:8000/api/prepare-mint', {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Success:', data.explorer);
        setNotification({
          message: "NFT MInted",
          type: "success",
        });
        setNftMintLoading(false);
        setExplorerData(data.explorer)
        return data; 
    } catch (error) {
      setNotification({
          
        message: `Error MInting NFT: ${error}`,
        type: "error",
      });
      console.error("Error in minting:", error);
    }
}
const handleSubmit = async(e)=>{
  e.preventDefault();
  setIsLoading(true);
  const imageUri = await imageUriMetaplex(userUpImage);
  console.log("ImageUri:", imageUri)
  const imageType = "image/png"
  const attributes = {}

  const metaDataUri = await createMetadata(
    imageUri,
    imageType,
    formData.name,
    formData.about,
    generateTokenId(8),
    attributes
  )
  console.log("MetaData",metaDataUri)

  /* minting Nft */
  const metaUri = metaDataUri.uri;
  const name = formData.name;
  const symbol = formData.symbol;
  const sellerFee = 500;

  const creator = [{address:wallet.publicKey.toString(), share:100}];

  const nft = await prepareMint(metaUri,name,symbol,sellerFee,creator)
  setIsLoading(false)
  
}
  
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
      <div className="glassmorphism max-w-sm mx-auto my-4 flex justify-center flex-col ">
          <h1 className="text-center text-2xl font-bold  my-4">
            NFT Details
          </h1>
    
        <form className=" mx-auto" onSubmit={handleSubmit}>
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
      {isLoading && (
     <div className="glassmorphism max-w-sm mx-auto">
    {imageLoading && (
        <div className="text-xl font-bold text-center glassmorphism shadow-lg p-4 flex items-center justify-around">
          <div>
          <CirclesWithBar
  height="50"
  width="50"
  color="#3662ED"
  outerCircleColor="#543BC3"
  innerCircleColor="#3662ED"
  barColor="#23BB6D"
  ariaLabel="circles-with-bar-loading"
  wrapperStyle={{}}
  wrapperClass=""
  visible={true}
  />
          </div>
          Generating Image Uri..
        </div>
      )}
      {metadataLoading && (
        <div className="text-xl font-bold text-center glassmorphism shadow-lg p-4 flex items-center justify-around">
        <div>
        <DNA
  visible={true}
  height="50"
  width="50"
  ariaLabel="dna-loading"
  wrapperStyle={{}}
  wrapperClass="dna-wrapper"
  />
        </div>
        Generating Metadata..
      </div>
      )}
      {nftLoading && (
        <div className="text-xl font-bold text-center glassmorphism shadow-lg p-4 flex items-center justify-around">
        <div>
        <Grid
  visible={true}
  height="50"
  width="50"
  color="#4fa94d"
  ariaLabel="grid-loading"
  radius="12.5"
  wrapperStyle={{}}
  wrapperClass="grid-wrapper"
  />
        </div>
        Minting NFT..
      </div>
      )}
      {explorerData && (
        <div className="text-xl font-bold text-center glassmorphism shadow-lg p-4 flex items-center justify-around">
        <Link href={explorerData || ""}>
          Eplore your NFT
        </Link>
        </div>
      )}
    </div>
     )}
     {}
  </main>
);
}
          
     
     
        
    


