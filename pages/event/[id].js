import Head from "next/head";
import { gql } from "@apollo/client";
import client from "../../apollo-client";
import {
  EmojiHappyIcon,
  TicketIcon,
  UsersIcon,
  LinkIcon,
} from "@heroicons/react/outline";

import formatTimestamp from "../../utils/formatTimestamp";
import Image from "next/image";

import { useState } from "react";
import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import connectContract from "../../utils/connectContract";
import Alert from "../../components/Alert";

function Event({ event }) {
  const { data: account } = useAccount();
  const [success, setSuccess] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(null);
  const [currentTimestamp, setEventTimestamp] = useState(new Date().getTime());

  function checkIfAlreadyRSVPed() {
    if (account) {
      const thisAccount = account.address.toLowerCase();
      for (let i = 0; i < event.rsvps.length; i++) {
        if (event.rsvps[i].attendee.id.toLowerCase() == thisAccount) {
          return true;
        }
      }
    }
    return false;
  }

  const newRSVP = async () => {
    try {
      const rsvpContract = connectContract();
      if (rsvpContract) {
        const txn = await rsvpContract.createNewRSVP(event.id, {
          value: event.deposit,
          gasLimit: 300000,
        });
        setLoading(true);
        console.log("Minting...", txn.hash);
        await txn.wait();
        console.log("minted --", txn.hash);
        setSuccess(true);
        setLoading(false);
        setMessage("Your RSVP has been created successfully.");
      } else {
        console.log("Error getting contract.");
      }
    } catch (error) {
      setSuccess(false);
      setMessage("Error!");
      setLoading(false);
      console.log(error);
    }
  };
  console.log("EVENT:", event);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Head>
        <title> {event.name} | web3rsvp</title>
        <meta name="description" content={event.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="relative py-12">
        {loading && (
          <Alert
            alertType={"loading"}
            alertBody={"Please wait"}
            triggerAlert={true}
            color={"white"}
          />
        )}
        {success && (
          <Alert
            alertType={"success"}
            alertBody={message}
            triggerAlert={true}
            color={"palegreen"}
          />
        )}
        {success === false && (
          <Alert
            alertType={"failed"}
            alertBody={message}
            triggerAlert={true}
            color={"palevioletred"}
          />
        )}
        <h6 className="mb-2">{formatTimestamp(event.eventTimestamp)}</h6>
        <h1 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-5xl mb-6 lg:mb-12">
          {event.name}
        </h1>
        <div className="flex flex-wrap-reverse lg:flex-nowrap">
          <div className="w-full pr-0 lg:pr-24 xl:pr-32">
            <div className="mb-8 w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
              {event.imageURL && (
                <Image src={event.imageURL} alt="event image" layout="fill" />
              )}
            </div>
            <p>{event.description}</p>
          </div>
          <div className="max-w-xs w-full flex flex-col gap-4 mb-6 lg:mb-0">
            {event.eventTimestamp > currentTimestamp ? (
              account ? (
                checkIfAlreadyRSVPed() ? (
                  <>
                    <span className="w-full text-center px-6 py-3 text-base font-medium rounded-full text-teal-800 bg-teal-100">
                      You have RSVPed! 🙌
                    </span>
                    <div className="flex item-center">
                      <LinkIcon className="w-6 mr-2 text-indigo-800" />
                      <a
                        className="text-indigo-800 truncate hover:underline"
                        href={event.link}
                      >
                        {event.link}
                      </a>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    className="w-full items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={newRSVP}
                  >
                    RSVP for {ethers.utils.formatEther(event.deposit)} MATIC
                  </button>
                )
              ) : (
                <ConnectButton />
              )
            ) : (
              <span className="w-full text-center px-6 py-3 text-base font-medium rounded-full border-2 border-gray-200">
                Event has ended
              </span>
            )}
            <div className="flex item-center">
              <UsersIcon className="w-6 mr-2" />
              <span className="truncate"># attending</span>
            </div>
            <div className="flex item-center">
              <TicketIcon className="w-6 mr-2" />
              <span className="truncate">1 RSVP per wallet</span>
            </div>
            <div className="flex items-center">
              <EmojiHappyIcon className="w-10 mr-2" />
              <span className="truncate">
                Hosted by{" "}
                <span className="truncate">
                  Hosted by{" "}
                  <a
                    className="text-indigo-800 truncate hover:underline"
                    href={`${process.env.NEXT_PUBLIC_TESTNET_EXPLORER_URL}address/${event.eventOwner}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {event.eventOwner}
                  </a>
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Event;

export async function getServerSideProps(context) {
  const { id } = context.params;

  const { data } = await client.query({
    query: gql`
      query Event($id: String!) {
        event(id: $id) {
          id
          eventID
          name
          description
          link
          eventOwner
          eventTimestamp
          maxCapacity
          deposit
          totalRSVPs
          totalConfirmedAttendees
          imageURL
          rsvps {
            id
            attendee {
              id
            }
          }
        }
      }
    `,
    variables: {
      id: id,
    },
  });

  return {
    props: {
      event: data.event,
    },
  };
}
