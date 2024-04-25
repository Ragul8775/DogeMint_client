import Link from "next/link";
import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
const Nav = () => {
  return (
    <nav className="flex justify-between w-full mb-16 pt-3 font-inter">
      <Link href={"/"} className="flex gap-2 items-center justify-center">
        <h1 className="logo_gradient font-bold text-3xl">DogeMint</h1>
      </Link>
      <WalletMultiButton />
    </nav>
  );
};

export default Nav;
