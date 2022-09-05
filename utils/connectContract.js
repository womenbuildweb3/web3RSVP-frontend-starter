import abiJSON from "./Web3RSVP.json";
import { ethers } from "ethers";

function connectContract() {
  const contractAddress = "0x92256FDd45f5Ff240eA8271fF26B68C8C52214fF";
  const contractABI = abiJSON.abi;
  let rsvpContract;
  try {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      rsvpContract = new ethers.Contract(contractAddress, contractABI, signer);
    } else {
      console.log("etherum object doesn't exist!");
    }
  } catch (error) {
    console.log("ERROR: ", error);
  }
  return rsvpContract;
}

export default connectContract;
