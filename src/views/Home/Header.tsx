"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { MenuProps } from "antd";
import { Dropdown, Space } from "antd";
import { getRoochNodeUrl } from "@roochnetwork/rooch-sdk";
import useStore from "@/store";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { useConnectWallet, useCurrentAddress, useWallets, useWalletStore } from "@roochnetwork/rooch-sdk-kit";
import WalletConnectModal from "@/components/WalletConnectModal";
import { shortAddress } from "@/utils/address";

const defaultMainnetUrl = process.env.NEXT_PUBLIC_DEFAULT_NETWORK;

const NetWork: any = {
  Mainnet: defaultMainnetUrl,
  Testnet: getRoochNodeUrl("testnet"),
  //Devnet: getRoochNodeUrl("devnet"),
  Localnet: getRoochNodeUrl("localnet"),
};
const items: MenuProps["items"] = [
  {
    key: NetWork.Mainnet,
    label: (
      <div>
        <p className="text-[#2f2f2f] font-bold ">Mainnet</p>
        <p className="text-[#198ffd] text-sm">{NetWork.Mainnet}</p>
      </div>
    ),
  },
  {
    key: NetWork.Testnet,
    label: (
      <div>
        <p className="text-[#2f2f2f] font-bold ">Testnet</p>
        <p className="text-[#198ffd] text-sm">{NetWork.Testnet}</p>
      </div>
    ),
  },
  // {
  //   key: NetWork.Devnet,
  //   label: (
  //     <div>
  //       <p className="text-[#2f2f2f] font-bold">Devnet</p>
  //       <p className="text-[#198ffd] text-sm">{NetWork.Devnet}</p>
  //     </div>
  //   ),
  // },
  {
    key: NetWork.Localnet,
    label: (
      <div>
        <p className="text-[#2f2f2f] font-bold">Localnet</p>
        <p className="text-[#198ffd] text-sm">{NetWork.Localnet}</p>
      </div>
    ),
  },
];

export default function Header() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [walletConnectModal, setWalletConnectModal] = useState(false);
  const currentAddress = useCurrentAddress();
  const connectionStatus = useWalletStore((state) => state.connectionStatus);
  const setWalletDisconnected = useWalletStore((state) => state.setWalletDisconnected);

  const [btnText, setBtnText] = useState("Connect Wallet");

  useEffect(() => {
    if (currentAddress) {
      setBtnText(shortAddress(currentAddress?.toStr(), 8, 6))
    }
  }, [currentAddress])

  const handleVisibleChange = (flag: boolean) => {
    setDropdownVisible(flag); // 更新 dropdown 的可见状态
  };
  const { roochNodeUrl, setRoochNodeUrl } = useStore();
  const mapNetName = useMemo(
    () =>
      Object.keys(NetWork).find((item: any) => NetWork[item] === roochNodeUrl),
    [roochNodeUrl]
  );

  const handleDropDownClick: MenuProps["onClick"] = ({ key }) => {
    setRoochNodeUrl(key);
    setDropdownVisible(false);
  };

  const handleConnect = async () => {
    if (connectionStatus === 'connected') {
      setWalletDisconnected();
      return;
    }
    setWalletConnectModal(true)
  }


  const renderWalletBtn = () => {
    if (connectionStatus === 'connected') {
      return <div
        onMouseEnter={() => setBtnText("Disconnect")}
        onMouseLeave={() => setBtnText(shortAddress(currentAddress?.toStr(), 8, 6))}
        onClick={handleConnect} className={"px-[10px] w-[180px] text-center py-[5px] rounded ml-[30px] transition-all cursor-pointer bg-[#00ADB280] hover:bg-[#ff000060]"}>
        {
          btnText
        }
      </div>;
    }
    return (
      <div onClick={handleConnect} className={"px-[10px] w-[180px] text-center py-[5px] rounded ml-[30px] cursor-pointer bg-[#00ADB2]"}>
        {
          'Connect Wallet'
        }
      </div>
    )
  }


  return (
    <header className="h-60 w-full flex items-center justify-between  px-[20px] fixed top-[0px] bg-white z-10">
      <Link href="/">
        <Image src="/images/logo.png" width="120" height={60} alt="" />
      </Link>
      <div className="flex items-center">
        <div className="w-[140px] cursor-pointer text-[#151918]">
          <Link href={'/txs'}>Transactions</Link>
        </div>
        <div className="w-[140px] cursor-pointer text-[#151918]">Analytics</div>
        <Dropdown
          onVisibleChange={handleVisibleChange}
          className="border p-[5px] rounded-lg border-gray-light"
          menu={{
            items,
            onClick: handleDropDownClick,
            selectedKeys: [roochNodeUrl],
            defaultSelectedKeys: [roochNodeUrl],
          }}
          arrow
          placement="bottom"
        >
          <div
            className=" cursor-pointer text-[15px]"
            onClick={(e) => e.preventDefault()}
          >
            <Space>
              {mapNetName} NetWork
              {!dropdownVisible ? (
                <DownOutlined className="text-[14px]" />
              ) : (
                <UpOutlined className="text-[14px]" />
              )}
            </Space>
          </div>
        </Dropdown>

        {
          renderWalletBtn()
        }

      </div>
      <WalletConnectModal open={walletConnectModal} onCancel={() => {
        setWalletConnectModal(false)
      }}></WalletConnectModal>
    </header>
  );
}
