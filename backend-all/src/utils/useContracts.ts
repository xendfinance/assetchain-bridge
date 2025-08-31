import { providers } from "ethers";
import { BridgeAssist__factory, Token__factory } from "@/contracts/typechain";

export function anyBridgeAssist(address: string, provider: providers.JsonRpcProvider){
    return BridgeAssist__factory.connect(address, provider)
}

export function anyToken(address: string, provider: providers.JsonRpcProvider){
    return Token__factory.connect(address, provider)
}

