import Head from 'next/head'
import { Layout } from '@/components/layout'
import { ListUsers } from '@/components/list-users'
// import { Room } from '@/components/room'

export default function Home() {
  return (
    <>
      <Head>
        <title>Pixboard.io - A realtime collaboration tool for editing images</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='description' content='A realtime collaboration tool for editing images' />
        <meta name='theme-color' content='#0d1117' />
        <link rel='icon' href='/favicon.ico' />
        <meta property='og:url' content='https://pixboard.vercel.app' />
        <meta property='og:type' content='website' />
        <meta
          property='og:title'
          content='Pixboard.io - A realtime collaboration tool for editing images'
        />
        <meta
          property='og:description'
          content='A realtime collaboration tool for editing images'
        />
        {/* <meta property='og:image' content='https://https://pixboard.vercel.app/ogimage.jpeg' /> */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@xavimonp' />
        <meta name='twitter:creator' content='@xavimonp' />
        <meta
          name='twitter:title'
          content='pixboard.io - A realtime collaboration tool for editing images'
        />
        <meta
          name='twitter:description'
          content='A realtime collaboration tool for editing images'
        />
      </Head>
      <Layout>
        {/* <Room /> */}
        <header className='flex flex-row justify-between items-center'>
          <div className='bg-white p-2.5 px-7 rounded-full flex'>
            <span className='font-semibold text-lg'>Pixboard.io</span>
          </div>
          <ListUsers />
        </header>
      </Layout>
    </>
  )
}
