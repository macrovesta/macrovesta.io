import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { prisma } from '../server/db';
import Sidebar from '../components/sidebar';
import Breadcrumbs from '../components/breadcrumbs';
import TabMenu from '../components/tabmenu';
import { useRouter } from "next/router";
import { TabMenuArray } from '../components/tabMenuArray'


//@ts-expect-error
const Home: NextPage = ({ usersData }) => {
  const router = useRouter();
  const url = router.pathname;

  const baseUrlArray = url.split('/');
  let urlArray: any = [];
  baseUrlArray.forEach((urlCrumb) => {
    if (urlCrumb.startsWith('[')) {
      urlArray.push(router.query[`${urlCrumb.slice(1, -1)}`])
    } else {
      urlArray.push(urlCrumb)
    }
  })
  let root = '';
  let urlPath = '';
  const splitUrl = (urlcrumbs: any, number: any) => {
    for (let i = 1; i < urlcrumbs.length; i++) {
      if (i < number) {
        root += '/';
        root += urlcrumbs[i];
      } else {
        urlPath += '/';
        urlPath += urlcrumbs[i];
      }
    }
  }
  splitUrl(urlArray, 1)

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen items-center bg-slate-200">
        <Sidebar />
        <div className="w-40"></div>
        <div className="flex w-full flex-col self-start">
          <header className="z-50 w-full grid grid-cols-[auto_1fr] grid-rows-1 bg-white shadow-center-md">
            <Breadcrumbs title={"Macrovesta Demo"} urlPath={urlPath} />
            <TabMenu data={TabMenuArray} urlPath={urlPath} />
          </header>
          <div className="p-6">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. At, facilis temporibus! Odit assumenda cupiditate possimus animi soluta natus vitae, provident dolores laboriosam corrupti. Sint ad, dolor dignissimos voluptatem iure quod.
          </div>
        </div>
      </main>
    </>
  );
};

export const getServerSideProps = async (context: any) => {
  const users = await prisma?.user.findMany({
  });
  const usersData = JSON.stringify(users);
  console.log(usersData)
  return {
    props: { usersData },
  };
};

export default Home;
