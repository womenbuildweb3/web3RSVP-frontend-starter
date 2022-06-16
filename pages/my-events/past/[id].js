import Head from "next/head";
import DashboardNav from "../../../components/DashboardNav";

function PastEvent() {

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Head>
          <title>My Dashboard | web3rsvp</title>
          <meta name="description" content="Manage your events and RSVPs" />
        </Head>
        <div className="flex flex-wrap py-8">
          <DashboardNav page={"events"} />
          <div className="sm:w-10/12 sm:pl-8">
          
          </div>
        </div>
      </div>
    )
}

export default PastEvent;

export async function getServerSideProps() {

}
