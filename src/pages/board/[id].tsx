import { useEffect } from 'react'
import { useRouter } from 'next/router'
import useStore from '@/state/store'
import { ListCursors } from '@/components/list-cursors'

export default function BoardView() {
  const {
    liveblocks: { enterRoom, leaveRoom }
  } = useStore()

  const { query } = useRouter()

  useEffect(() => {
    if (!query.id) return

    enterRoom(query.id as string)

    return () => {
      leaveRoom(query.id as string)
    }
  }, [query.id])

  return (
    <div>
      <h1>Lookin at {query.id}</h1>
      <ListCursors />
    </div>
  )
}