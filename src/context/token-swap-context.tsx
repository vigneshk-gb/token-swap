"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { BrowserExtensionSigningManager } from "@polymeshassociation/browser-extension-signing-manager";
import { Polymesh } from "@polymeshassociation/polymesh-sdk";
import { NetworkInfo } from "@polymeshassociation/browser-extension-signing-manager/types";
import { toast } from "react-toastify";
import BigNumber from "bignumber.js";
import { CreateAssetParams } from "@polymeshassociation/polymesh-sdk/types";
import { it } from "node:test";
import { JsonRpcSigner } from "ethers";

type TokenSwapContextProviderProps = {
  children: React.ReactNode;
};

type Theme = "dark" | "light";

type TokenSwapContextValue = {
  theme: Theme;
  signingManager?: BrowserExtensionSigningManager | undefined;
  signingManagerMetamask?: JsonRpcSigner | undefined;
  network?: NetworkInfo;
  sdk?: Polymesh;
  chain?: string;
  accounts?: string[];
  walletError?: string;
  createSigningManager: () => void;
  setSigningManager: React.Dispatch<React.SetStateAction<BrowserExtensionSigningManager | undefined>>;
  setSigningManagerMetamask: React.Dispatch<React.SetStateAction<JsonRpcSigner | undefined>>;
  address: string |  null;
  setAddress: React.Dispatch<React.SetStateAction<string | null>>;
  isLoadingPolymesh:boolean;
  setIsLoadingPolymesh: React.Dispatch<React.SetStateAction<boolean>>
};

export const TokenSwapContext = createContext<TokenSwapContextValue | null>(
  null
);

export default function TokenSwapContextProvider({
  children,
}: TokenSwapContextProviderProps) {
  const [theme, setTheme] = useState<Theme>("light");

  const [signingManager, setSigningManager] =
    useState<BrowserExtensionSigningManager | undefined>();

  const [signingManagerMetamask, setSigningManagerMetamask] =
    useState<JsonRpcSigner | undefined>();

  const [network, setNetwork] = useState<NetworkInfo>();
  const [sdk, setSdk] = useState<Polymesh>();
  const [chain, setChain] = useState<string>();
  const [accounts, setAccounts] = useState<string[]>();
  const [walletError, setWalletError] = useState<string>();
  const [address, setAddress] = useState<string | null>(null);
  const [isLoadingPolymesh, setIsLoadingPolymesh] = useState<boolean>(false);


  // Define reference for tracking component mounted state.
  const mountedRef = useRef(false);
  // Effect for tracking mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const createSigningManager = async () => {
    const { BrowserExtensionSigningManager } = await import(
      "@polymeshassociation/browser-extension-signing-manager"
    );
    try {
      const browserSigningManager = await BrowserExtensionSigningManager.create(
        {
          appName: "token-swap", //Name of dApp used when wallet prompts to authorize connection.
          extensionName: "polywallet", // 'polywallet' is the default if omitted.
        }
      );

      if (mountedRef.current) {
        setSigningManager(browserSigningManager);
      }
    } catch (error) {
      if (error instanceof Error) {
        setWalletError(error.message);
      } else {
        throw error;
      }
    }
  };

  // Set the Node URL and handle changes in in network.
  // Note: The network object requires the Polymesh "polywallet" browser extension.
  // For other extension types or connecting to an alternate node the address should be set manually.
  useEffect(() => {
    if (!signingManager) return;
    let effectMounted = true;

    const readNodeAddressFromWallet = async () => {
      // @ts-ignore
      const networkInfo = await signingManager.extension.network.get();
      if (effectMounted) {
        setNetwork(networkInfo);
      }
    };
    readNodeAddressFromWallet();

    const unsubNetworkChange = signingManager.onNetworkChange((network) => {
      if (effectMounted) setNetwork(network);
      toast.dismiss();
    });
    return () => {
      effectMounted = false;
      unsubNetworkChange && unsubNetworkChange();
    };
  }, [signingManager]);

  // Connect to the Polymesh SDK
  useEffect(() => {
    if (!network || !signingManager) return;
    let effectMounted = true;
    let polymeshSdk: Polymesh;

    // let wssUrl = 'wss://dev-fsn001.nsite.dev/staging/'
    
    console.log(
      `\nConnecting to Polymesh ${network.name} at ${network.wssUrl}.\n`
    );

    const connect = async () => {
      try {
        polymeshSdk = await Polymesh.connect({
          // nodeUrl: network.wssUrl,
          nodeUrl: network.wssUrl,
          signingManager,
        });
        const chainName = (
          await polymeshSdk._polkadotApi.rpc.system.chain()
        ).toString();
        if (effectMounted) {
          setSdk(polymeshSdk);
          setChain(chainName);
        }
      } catch (error) {
        if (error instanceof Error) {
          error.message ===
          "Unsupported Polymesh RPC node version. Please upgrade the SDK"
            ? toast.error(
                "The chain runtime or RPC node version is not supported.",
                { autoClose: false, theme: "colored" }
              )
            : toast.error(error.message, {
                autoClose: false,
                theme: "colored",
              });
        } else {
          throw error;
        }
      }
    };
    connect();

    return () => {
      effectMounted = false;
      polymeshSdk?.disconnect();
      // If unmount was triggered by network change and component is still mounted set to undefined
      if (mountedRef.current) {
        setSdk(undefined);
        setAccounts(undefined);
      }
    };
  }, [network, signingManager]);

  useEffect(() => {
    if (!signingManager || !sdk) return;
    setIsLoadingPolymesh(false);
    let effectMounted = true;
    const readAccounts = async () => {
      const allAccounts = await signingManager.getAccounts();

      if (effectMounted) setAccounts(allAccounts);
    };

    readAccounts();

    const unsubAccounts = signingManager.onAccountChange((allAccounts) => {
      const setSelectedAccountToSigner = async () => {
        await sdk.setSigningAccount(allAccounts[0] as string);
      };

      if (effectMounted) {
        setAccounts(allAccounts as string[]);
        setSelectedAccountToSigner();
      }
    }, false);

    return () => {
      unsubAccounts && unsubAccounts();
    };
  }, [signingManager, sdk]);

  return (
    <TokenSwapContext.Provider
      value={{
        theme,
        signingManager,
        signingManagerMetamask,
        setSigningManager,
        setSigningManagerMetamask,
        network,
        sdk,
        chain,
        accounts,
        walletError,
        createSigningManager,
        address,
        setAddress,
        isLoadingPolymesh,
        setIsLoadingPolymesh
      }}
    >
      {children}
    </TokenSwapContext.Provider>
  );
}

export function useTokenSwapContext() {
  const context = useContext(TokenSwapContext);

  if (!context) {
    throw new Error(
      "TokenSwapContext should be used within EczodexContextProvider"
    );
  }

  return context;
}
