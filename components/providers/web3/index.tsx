import { MetaMaskInpageProvider } from '@metamask/providers'
import { NftMarketContract } from '@_types/nftMarketContract'
import { ethers } from 'ethers'
import { createContext, useContext, useEffect, useState } from 'react'
import {
  createWeb3State,
  generateInitialState,
  loadContract,
  Web3State,
} from './utils'

const pageReload = () => {
  window.location.reload()
}

const handleAccount = (ethereum: MetaMaskInpageProvider) => async () => {
  const isLocked = !(await ethereum._metamask.isUnlocked())
  if (isLocked) {
    pageReload()
  }
}

const setGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
  ethereum.on('chainChanged', pageReload)
  ethereum.on('accountsChanged', handleAccount(ethereum))
}

const removeGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
  ethereum?.removeListener('chainChanged', pageReload)
  ethereum?.removeListener('accountsChanged', handleAccount)
}

const Web3Context = createContext<Web3State>({} as Web3State)

interface Props {
  children: React.ReactNode
}

const Web3Provider: React.FC<Props> = ({ children }) => {
  const [web3Api, setWeb3Api] = useState<Web3State>(generateInitialState())

  useEffect(() => {
    async function initWeb3() {
      try {
        const provider = new ethers.providers.Web3Provider(
          window.ethereum as any
        )
        const contract = await loadContract('NftMarket', provider)

        const signer = provider.getSigner()
        const signedContract = contract.connect(signer)

        setTimeout(() => setGlobalListeners(window.ethereum), 500)
        setWeb3Api(
          createWeb3State({
            ethereum: window.ethereum,
            provider,
            contract: signedContract as unknown as NftMarketContract,
            isLoading: false,
          })
        )
      } catch (error: any) {
        console.error(
          'We cannot connect to your Ethereum wallet. Please install MetaMask.'
        )
        setWeb3Api((prevState) =>
          createWeb3State({ ...(prevState as any), isLoading: false })
        )
      }
    }

    initWeb3()
    return () => removeGlobalListeners(window.ethereum)
  }, [])

  return (
    <Web3Context.Provider value={{ ...web3Api }}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context)

export const useHooks = () => {
  const { hooks } = useWeb3()
  return hooks
}

export default Web3Provider
