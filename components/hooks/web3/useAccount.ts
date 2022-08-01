import { useEffect } from 'react'
import { CryptoHookFactory } from '@_types/hooks'
import useSWR from 'swr'

type AccountHookResponse = {
  connect: () => void
  isLoading: boolean
  isInstalled: boolean
}

type AccountHookFactory = CryptoHookFactory<string, AccountHookResponse>

export type UseAccountHook = ReturnType<AccountHookFactory>

export const hookFactory: AccountHookFactory =
  ({ provider, ethereum, isLoading }) =>
  () => {
    const { data, mutate, isValidating, ...swr } = useSWR(
      provider ? 'web3/useAccount' : null,
      async () => {
        const accounts = await provider!.listAccounts()
        const [account] = accounts

        if (!account) {
          throw 'Cannot retireve account!, please, connect to web3 wallet'
        }

        return account
      },
      {
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }
    )

    useEffect(() => {
      ethereum?.on('accountsChanged', handleAccountsChanged)

      return () => {
        ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      }
    })

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[]

      if (accounts.length === 0) {
        console.error('Please, connect to web3 wallet')
      } else if (accounts[0] !== data) {
        mutate(accounts[0])
      }
    }

    const connect = async () => {
      await ethereum?.request({ method: 'eth_requestAccounts' })
    }

    return {
      ...swr,
      data,
      isValidating,
      isLoading: isLoading as boolean,
      isInstalled: ethereum?.isMetaMask || false,
      mutate,
      connect,
    }
  }
