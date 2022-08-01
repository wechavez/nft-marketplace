import { setupHooks, Web3Hooks } from '@hooks/web3/setupHooks'
import { MetaMaskInpageProvider } from '@metamask/providers'
import { Web3Dependencies } from '@_types/hooks'
import { Contract, providers } from 'ethers'

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider
  }
}

type Nullable<T> = {
  [P in keyof T]: T[P] | null
}

export type Web3State = {
  isLoading: boolean
  hooks: Web3Hooks
} & Nullable<Web3Dependencies>

export const generateInitialState = (): Web3State => ({
  isLoading: true,
  ethereum: null,
  provider: null,
  contract: null,
  hooks: setupHooks({ isLoading: true } as any),
})

export const createWeb3State = ({
  ethereum,
  provider,
  contract,
  isLoading,
}: Web3Dependencies): Web3State => ({
  isLoading,
  ethereum,
  provider,
  contract,
  hooks: setupHooks({ ethereum, provider, contract, isLoading }),
})

const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID

export const loadContract = async (
  contractName: string,
  provider: providers.Web3Provider
): Promise<Contract> => {
  if (!NETWORK_ID) {
    return Promise.reject('Network ID is not defined')
  }

  const Artifact = await fetch(`/contracts/${contractName}.json`).then((res) =>
    res.json()
  )

  if (Artifact.networks[NETWORK_ID].address) {
    const contract = new Contract(
      Artifact.networks[NETWORK_ID].address,
      Artifact.abi,
      provider
    )

    return contract
  } else {
    return Promise.reject(
      `Contract ${contractName} is not deployed on network ${NETWORK_ID}`
    )
  }
}
