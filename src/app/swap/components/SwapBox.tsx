"use client";

import React, { useEffect, useRef, useState } from "react";
import { BigNumber, Polymesh } from "@polymeshassociation/polymesh-sdk";
import {
  PolymeshError,
  PolymeshTransactionBase,
} from "@polymeshassociation/polymesh-sdk/internal";
import {
  GenericPolymeshTransaction,
  TransactionStatus,
  UnsubCallback,
} from "@polymeshassociation/polymesh-sdk/types";
import Image from "next/image";

import { ethers } from "ethers";
import axios from "axios";

import { IoIosSwitch } from "react-icons/io";
import { MdOutlineRefresh } from "react-icons/md";
import { CiSettings } from "react-icons/ci";
import { RiArrowDropDownLine } from "react-icons/ri";
import { CiWallet } from "react-icons/ci";
import { FaArrowDownLong } from "react-icons/fa6";

import ethLogo from "../../../../public/icons/eth.png";
import usdcLogo from "../../../../public/icons/usdc.png";
import POLYXLogo from "../../../../public/icons/polyx.png";

import contractAbi from "../../../lib/token-swap.json";
import { useTokenSwapContext } from "@/context/token-swap-context";
import {
  formatNumberWithCommas,
  formatWalletHash,
  formatWalletHashSmaller,
} from "@/utils/formater";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";

const styles = {
  container: `relative w-full max-w-[500px] h-fit min-h-[500px] mt-[100px] mx-auto flex flex-col items-center gap-3 z-10`,
  arrowCtn: `bg-[#1C1E2F] rounded-lg p-2 drop-shadow-2xl absolute top-[52%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer hover:rotate-180 transition-all ease-in-out duration-500`,
  topCtn: `w-full h-fit flex items-center justify-between`,
  fromCtn: `w-full h-fit min-h-[200px] bg-[#2C2D51] rounded-3xl p-[18px] flex flex-col gap-6 z-10 bg-opacity-70`,
  InnerTopCtn: `w-full h-fit flex items-center justify-between`,
  InnerMiddleCtn: `w-full h-fit`,
  InnerSecondLastCtn: `w-full h-fit flex items-center justify-between`,
  InnerBottomCtn: `w-full flex items-center justify-between gap-3`,
  tickerBalanceCtn: `w-fit h-fit flex items-center gap-2 px-[10px] py-[5px]`,
  activeTicker: `text-[12px] text-[#949BE0] hover:text-[#BCBED5] cursor-default font-medium leading-normal text-center transition-all ease-in-out duration-200 drop-shadow-2xl`,
  percentItem: `flex-1 text-[14px] text-[#BCBED5] hover:text-[#949BE0] font-medium leading-normal text-center px-[20px] py-[5px] rounded-md bg-[#1C1E2F]  cursor-pointer transition-all ease-in-out duration-100 drop-shadow-2xl`,
  inputWrapper: `flex items-center justify-between gap-5`,
  inputBox: `w-2/3 text-[30px] text-[#FFF] placeholder:text-[#FFF] placeholder:text-opacity-90 font-semibold leading-normal bg-transparent text-clip appearance-none outline-none border-none shadow-none p-0 m-0`,
  inputBoxSec: `w-7/12 text-[16px] text-[#FFF] placeholder:text-[#FFF] placeholder:text-opacity-90 font-semibold leading-normal bg-transparent text-clip appearance-none outline-none border-none shadow-none p-0 m-0`,
  dropdown: `flex-1 relative`,
  dropdownMenu: `absolute w-full left-0 top-10 bg-[#1C1E2F] rounded-xl transition-all ease-in-out duration-200`,
  dropdownActiveItem: `flex items-center justify-between gap-1 text-[14px] text-[#BCBED5] hover:text-[#949BE0]  font-medium leading-normal px-[20px] py-[5px] rounded-xl bg-[#1C1E2F] cursor-pointer transition-all fade-in duration-100 drop-shadow-2xl`,
  dropdownItem: `w-full text-[14px] text-[#BCBED5] hover:text-[#949BE0] font-medium leading-normal text-left px-[20px] py-[5px] rounded-xl hover:bg-[#2C2D51] cursor-pointer transition-all ease-in-out duration-200`,
  tickersLogoCtn: `w-fit flex gap-3`,
  label: `text-[14px] text-[#AAB3FF] font-semibold leading-normal `,
  toCtn: `w-full h-fit min-h-[200px] bg-[#2C2D51] rounded-3xl p-[18px] flex flex-col gap-6 z-10 bg-opacity-70`,
  primaryBtn: `w-1/2 min-w-fit h-fit flex items-center justify-center gap-2 text-[14px] text-[#BCBED5] hover:text-[#949BE0] font-bold leading-normal text-center px-[20px] py-[10px] rounded-md bg-[#1C1E2F]  cursor-pointer transition-all ease-in-out duration-100 drop-shadow-2xl`,
};

const SwapBox = () => {
  const { signingManagerMetamask, address, sdk } = useTokenSwapContext();

  const [isFromOpen, setIsFromOpen] = useState<boolean>(false);
  const [isToOpen, setIsToOpen] = useState<boolean>(false);

  const [selectedIndexFrom, setSelectedIndexFrom] = useState<number>(0);
  const [selectedIndexTo, setSelectedIndexTo] = useState<number>(0);

  const [fromAmount, setFromAmount] = useState<string | null>(null);
  const [toAmount, setToAmount] = useState<string | null>(null);
  const [toAddress, setToAddress] = useState<string | null>();

  const fromDropDownRef = useRef<HTMLDivElement>(null);
  const toDropDownRef = useRef<HTMLDivElement>(null);

  //transfer polyx
  const [selectedAccount, setSelectedAccount] = useState<string>(address ?? "");
  const [destinationAccount, setDestinationAccount] = useState<string>("");
  const [availableBalance, setAvailableBalance] = useState<string>("0");
  const [inputValue, setInputValue] = useState("");
  const [memo, setMemo] = useState<string>("");
  const [transferTx, setTransferTx] =
    useState<GenericPolymeshTransaction<void, void>>();
  const [transactionInProcess, setTransactionInProcess] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //bridgetopolymesh
  const [transactionHash, setTransactionHash] = useState();
  const [transactionStatus, setTransactionStatus] = useState();

  // Define reference for tracking component mounted state.
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const toggleIsFromOpen = () => {
    setIsFromOpen((prev) => !prev);
  };

  const toggleIsToOpen = () => {
    setIsToOpen((prev) => !prev);
  };

  const handleFromDropDownSelect = (index: number) => {
    setSelectedIndexFrom(index);
    setIsFromOpen(false);
  };

  const handleToDropDownSelect = (index: number) => {
    setSelectedIndexTo(index);
    setIsToOpen(false);
  };

  //useEffects

  // Subscribe to the selected account's balance.

  useEffect(() => {
    const getAccountBalance = async () => {
      if (!sdk || !address) return;
      try {
        const balance = await sdk.accountManagement.getAccountBalance({
          account: address,
        });
        setAvailableBalance(balance.free.toString());
      } catch (error) {
        console.log(error);
      }
    };
    getAccountBalance();

    return () => {
      setAvailableBalance("0");
    };
  }, [sdk, address]);

  useEffect(() => {
    if (!signingManagerMetamask || !address) return;

    if (!address.startsWith("0x")) return;

    const checkAvailableBalance = async () => {
      try {
        const contractAddress = "0xf08B481A557BF0707DFAD08aD7D3f8D785FAE864";
        const tokensContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signingManagerMetamask
        );

        const balance = await tokensContract.balanceOf(address);
        const weiValue = BigInt(balance);
        const ethValue = Number(weiValue) / 1e18;
        const convertedBalance = ethValue.toString();
        setAvailableBalance(convertedBalance);
      } catch (error) {
        console.log(error);
      }
    };

    checkAvailableBalance();
  }, [address, transactionHash]);

  useEffect(() => {
    if (!sdk || !address) return;

    if (address.startsWith("0x")) return;

    let unsubBalance: UnsubCallback;
    const checkAvailableBalance = async () => {
      unsubBalance = await sdk.accountManagement.getAccountBalance(
        { account: address },
        (balance) => {
          if (mountedRef.current) setAvailableBalance(balance.free.toString());
        }
      );
    };
    checkAvailableBalance();
    return () => {
      unsubBalance && unsubBalance();
    };
  }, [sdk, address]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        fromDropDownRef.current &&
        !fromDropDownRef.current.contains(event.target as Node)
      ) {
        setIsFromOpen(false);
      }
    };

    // Attach the event listener to the document
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener when the component is unmounted
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toDropDownRef.current &&
        !toDropDownRef.current.contains(event.target as Node)
      ) {
        setIsToOpen(false);
      }
    };

    // Attach the event listener to the document
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener when the component is unmounted
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const tickersOne = address?.startsWith("0x") ? ["WPOLYX"] : ["POLYX"];
  const tickersTwo = address?.startsWith("0x") ? ["POLYX"] : ["WPOLYX"];

  const handleChangeAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const { value } = e.target;
    const normalizedValue = value.replace(",", ".");
    const regex = /^[0-9]*[.,]?[0-9]*$/;

    const setAmount = (setter: (value: string) => void) => {
      if (normalizedValue.endsWith(".")) {
        if (normalizedValue.indexOf(".") !== normalizedValue.lastIndexOf("."))
          return;
        setter(normalizedValue);
      } else if (regex.test(normalizedValue) || normalizedValue === "") {
        setter(normalizedValue);
      }
    };

    if (field === "from") {
      setAmount(setFromAmount);
    } else if (field === "to") {
      setAmount(setToAmount);
    }
  };

  const handleChangeAddress = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const { value } = e.target;

    if (field === "to") {
      setToAddress(value);
    }
  };

  //web3

  const transferPolyx = async () => {
    if (transactionInProcess || !sdk || !fromAmount || !toAddress) return;

    function isValidAddress(address: string): boolean {
      // Ethereum address regex: starts with "0x" followed by 40 hex characters (0-9, a-f, A-F)
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

      // Polymesh address regex: starts with "5" and is 48 characters long
      const polyAddressRegex = /^5[a-zA-Z0-9]{47}$/;

      // Check if the address matches either Ethereum or Polymesh address format
      return ethAddressRegex.test(address) || polyAddressRegex.test(address);
    }

    const checkIsValidAddress = isValidAddress(toAddress);

    if (!fromAmount) {
      toast.error("Enter token amount");
      return;
    }

    if (!checkIsValidAddress) {
      toast.error("Invalid target address");
      return;
    }

    setIsLoading(true);
    try {
      const transferPolyxTx = await sdk.network.transferPolyx({
        amount: new BigNumber(fromAmount),
        to: "5DXCKHv57XeHGck8hDEUHXviQD2SQwenknda9korQZHPzpwR",
        memo: memo,
      });

      const receipt = await transferPolyxTx.run();

      transferPolyxTx.onStatusChange((tx) => setTransferTx(tx));

      if (mountedRef.current) setTransferTx(transferPolyxTx);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (!transferTx) return;

    const bridgeToEvm = async () => {
      try {
        const updatedItem = {
          polymeshAddress: address,
          evmAddress: toAddress,
          evmBlockchain: "Sepolia",
          transactionHash: transferTx.txHash,
          amount: fromAmount,
        };

        const response = await axios({
          method: "post",
          url: `https://polymesh-bridge.azurewebsites.net/Bridge/BridgeToEVM`,
          data: updatedItem,
        });

        if (response.status === 200) {
          setIsLoading(false);
          toast.success("Transfer Successful");
          setFromAmount(null);
          setToAddress(null);
        }
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    };

    bridgeToEvm();
  }, [transferTx]);

  useEffect(() => {
    if (!transactionHash) return;

    const bridgeToPolymesh = async () => {
      try {
        const updatedItem = {
          polymeshAddress: toAddress,
          evmAddress: address,
          evmBlockchain: "Sepolia",
          transactionHash: transactionHash,
          amount: fromAmount,
        };

        const response = await axios({
          method: "post",
          url: `https://polymesh-bridge.azurewebsites.net/Bridge/BridgeToPolymesh`,
          data: updatedItem,
        });

        if (response.status === 200) {
          setIsLoading(false);
          toast.success("Transfer Successful");
          // toast.success(`https://sepolia.etherscan.io/tx/${transactionHash}`);
          setFromAmount(null);
          setToAddress(null);
        }
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    };

    bridgeToPolymesh();
  }, [transactionHash]);

  const burnTokens = async () => {
    if (!signingManagerMetamask || !toAddress) return;

    function isValidAddress(address: string): boolean {
      // Ethereum address regex: starts with "0x" followed by 40 hex characters (0-9, a-f, A-F)
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

      // Polymesh address regex: starts with "5" and is 48 characters long
      const polyAddressRegex = /^5[a-zA-Z0-9]{47}$/;

      // Check if the address matches either Ethereum or Polymesh address format
      return ethAddressRegex.test(address) || polyAddressRegex.test(address);
    }

    const checkIsValidAddress = isValidAddress(toAddress);

    if (!checkIsValidAddress) {
      toast.error("Invalid address");
      return;
    }
    setIsLoading(true);

    try {
      //@ts-ignore

      const ethValue = parseFloat(fromAmount); // For example, 100 ETH
      const weiValue = BigInt(ethValue * 1e18);


      const contractAddress = "0xf08B481A557BF0707DFAD08aD7D3f8D785FAE864";
      const tokensContract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signingManagerMetamask
      );
      // Call the burn function with a specified gas limit
      const tx = await tokensContract.burn(weiValue, address, {
        gasLimit: 300000, // Set an appropriate gas limit
      });
      console.log("Transaction sent:", tx);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      setTransactionHash(receipt.hash);
      console.log("Transaction mined:", receipt);
    } catch (error) {
      setIsLoading(false);

      console.error("Error burning tokens:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topCtn}>
        <IoIosSwitch size={25} />
        <div className="flex gap-2">
          <MdOutlineRefresh size={25} />
          <CiSettings size={25} />
        </div>
      </div>
      <div className={styles.fromCtn}>
        <div className={styles.InnerTopCtn}>
          <span className={styles.label}>From</span>
          <div className={styles.tickersLogoCtn}>
            {address?.startsWith("0x") ? (
              <Image
                src={ethLogo}
                alt="ethLogo"
                width={22}
                height={22}
                className="cursor-pointer"
                onClick={() => setSelectedIndexFrom(0)}
              />
            ) : (
              <Image
                src={POLYXLogo}
                alt="POLYXLogo"
                width={22}
                height={22}
                className="cursor-pointer"
                onClick={() => setSelectedIndexFrom(2)}
              />
            )}

            {/* <Image
              src={usdcLogo}
              alt="usdclogo"
              width={22}
              height={22}
              className="cursor-pointer"
              onClick={() => setSelectedIndexFrom(1)}
            /> */}
          </div>
        </div>
        <div className={styles.InnerMiddleCtn}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              placeholder="0.00"
              className={styles.inputBox}
              inputMode="decimal"
              pattern="^[0-9]*[.,]?[0-9]*$"
              title="Please enter a valid number"
              onChange={(e) => handleChangeAmount(e, "from")}
              value={fromAmount || ""}
            />
            <div className={styles.dropdown} ref={fromDropDownRef}>
              <div
                className={styles.dropdownActiveItem}
                onClick={toggleIsFromOpen}
              >
                <span>{tickersOne[selectedIndexFrom]}</span>
                <RiArrowDropDownLine
                  size={25}
                  className={`${isFromOpen ? "rotate-180" : ""}`}
                />
              </div>
              <ul
                className={`${styles.dropdownMenu} ${isFromOpen ? "block z-10" : "hidden"
                  }`}
              >
                {tickersOne.map((el, i) => (
                  <li
                    className={styles.dropdownItem}
                    onClick={() => handleFromDropDownSelect(i)}
                    key={i}
                  >
                    {el}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.InnerSecondLastCtn}>
          <input
            type="text"
            placeholder={
              address?.startsWith("0x")
                ? "0xc1D04...0c8948b"
                : "5CV4DzB...vjWwWr9"
            }
            className={styles.inputBoxSec}
            inputMode="decimal"
            pattern="^[0-9]*[.,]?[0-9]*$"
            title="Please enter a valid number"
            onChange={(e) => handleChangeAmount(e, "from")}
            value={formatWalletHash(address ?? "")}
            disabled={true}
          />
          <div className={styles.tickerBalanceCtn}>
            <CiWallet size={20} />
            <div className={styles.activeTicker}>
              {`${address
                  ? formatNumberWithCommas(parseFloat(availableBalance))
                  : "0"
                } ${tickersOne[selectedIndexFrom]}`}
            </div>
          </div>
        </div>
        <div className={styles.InnerBottomCtn}>
          <div className={styles.percentItem}>25%</div>
          <div className={styles.percentItem}>50%</div>
          <div className={styles.percentItem}>75%</div>
          <div className={styles.percentItem}>100%</div>
        </div>
      </div>
      <div className={styles.arrowCtn}>
        <FaArrowDownLong size={15} />
      </div>
      <div className={styles.toCtn}>
        <div className={styles.InnerTopCtn}>
          <span className={styles.label}>To</span>
          <div className={styles.tickersLogoCtn}>
            {address?.startsWith("0x") ? (
              <Image
                src={POLYXLogo}
                alt="POLYXLogo"
                width={22}
                height={22}
                className="cursor-pointer"
                onClick={() => setSelectedIndexTo(2)}
              />
            ) : (
              <Image
                src={ethLogo}
                alt="ethLogo"
                width={22}
                height={22}
                className="cursor-pointer"
                onClick={() => setSelectedIndexTo(0)}
              />
            )}

            {/* <Image
              src={usdcLogo}
              alt="usdclogo"
              width={22}
              height={22}
              className="cursor-pointer"
              onClick={() => setSelectedIndexTo(1)}
            /> */}
          </div>
        </div>

        <div className={styles.InnerMiddleCtn}>
          <div className={styles.inputWrapper}>
            {/* <input
              type="text"
              placeholder="0.00"
              className={styles.inputBox}
              inputMode="decimal"
              pattern="^[0-9]*[.,]?[0-9]*$"
              title="Please enter a valid number"
              onChange={(e) => handleChangeAmount(e, "to")}
              value={toAmount || ""}
              disabled={true}
            /> */}
            <input
              type="text"
              placeholder="address"
              className={styles.inputBoxSec}
              inputMode="decimal"
              pattern="^[0-9]*[.,]?[0-9]*$"
              title="Please enter a valid number"
              onChange={(e) => handleChangeAddress(e, "to")}
              value={toAddress ?? ""}
            />
            <div className={styles.dropdown} ref={toDropDownRef}>
              <div
                className={styles.dropdownActiveItem}
                onClick={toggleIsToOpen}
              >
                <span>{tickersTwo[selectedIndexTo]}</span>
                <RiArrowDropDownLine
                  size={25}
                  className={`${isToOpen ? "rotate-180" : ""}`}
                />
              </div>
              <ul
                className={`${styles.dropdownMenu} ${isToOpen ? "block z-10" : "hidden"
                  }`}
              >
                {tickersTwo.map((el, i) => (
                  <li
                    className={styles.dropdownItem}
                    onClick={() => handleToDropDownSelect(i)}
                    key={i}
                  >
                    {el}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* <div className={styles.InnerSecondLastCtn}>
          <input
            type="text"
            placeholder="target address"
            className={styles.inputBoxSec}
            inputMode="decimal"
            pattern="^[0-9]*[.,]?[0-9]*$"
            title="Please enter a valid number"
            onChange={(e) => handleChangeAddress(e, "to")}
            value={toAddress ?? ""}
          />
          <div className={styles.tickerBalanceCtn}>
            <CiWallet size={22} />
            <div className={styles.activeTicker}>
              {tickers[selectedIndexTo]}
            </div>
          </div>
        </div> */}
      </div>

      <button
        className={styles.primaryBtn}
        onClick={address?.startsWith("0x") ? burnTokens : transferPolyx}
        disabled={isLoading}
      >
        <ClipLoader
          color="#949BE0"
          loading={isLoading}
          size={20}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
        Bridge
      </button>
    </div>
  );
};

export default SwapBox;
