import 'styles/globals.css'
import { Provider as ConnectionProvider } from 'context/connect'
import { useRouter } from 'next/router'
import Sidebar from 'components/Sidebar';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  return <ConnectionProvider>
    <Head>
      <title>Chat App</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    </Head>
    {router.pathname.includes('rooms') ? (
      <div className="flex">
        <Sidebar />
        <div className="overflow-y-auto w-full">
          <Component {...pageProps} />
        </div>
      </div>
    ) : <Component {...pageProps} />}
  </ConnectionProvider>
}

export default MyApp;
