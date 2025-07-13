import { providers } from "ethers";
import { BridgeAssist__factory } from "@/contracts/typechain";

export function anyBridgeAssist(address: string, provider: providers.JsonRpcProvider){
    return BridgeAssist__factory.connect(address, provider)
}

