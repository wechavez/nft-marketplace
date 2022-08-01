import { useListedNfts } from '@hooks/web3'
import { FunctionComponent } from 'react'
import { Nft } from '../../../../types/nft'
import NftItem from '../item'

type NftListProps = {}

const NftList: FunctionComponent<NftListProps> = () => {
  const { nfts } = useListedNfts()
  const { data: listedNfts = [], buyNft } = nfts

  return (
    <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
      {listedNfts.map((nft) => (
        <div
          key={nft.meta.image}
          className="flex flex-col rounded-lg shadow-lg overflow-hidden"
        >
          <NftItem item={nft} buyNft={buyNft} />
        </div>
      ))}
    </div>
  )
}

export default NftList
