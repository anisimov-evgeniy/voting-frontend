import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Button, notification, Typography } from 'antd';

import { contractAbi, contractAddress } from './contractData/contractData';
import VoteForm from './Components/VoteForm/VoteForm';
import { CandidateType } from './types/types';
import './App.css';

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTimeRemaining, setIsTimeRemaining] = useState(true);
  const [remainingTime, setRemainingTime] = useState<string | number>('');
  const [candidates, setCandidates] = useState<CandidateType[] | null>([]);
  const [number, setNumber] = useState<number | string>('');
  const [alreadyVoted, setCanVote] = useState(true);

  useEffect(() => {
    if (account) {
      getCandidates().then((currentCandidates) => setCandidates(currentCandidates));
      getRemainingTime().then((time) => setRemainingTime(time));
      getCurrentStatus().then(status => setIsTimeRemaining(status));
    }
  // eslint-disable-next-line
  }, [account]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  });

  async function getContractInstance() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();

    return new ethers.Contract(contractAddress, contractAbi, signer);
  }

  async function getCandidates(): Promise<CandidateType[]> {
    const contractInstance = await getContractInstance();
    const candidates = await contractInstance.getAllVotesOfCandidates();

    return candidates.map((candidate: { name: string; voteCount: bigint}, index: number) => ({
      index,
      name: candidate.name,
      voteCount: Number(candidate.voteCount)
    })
    );
  }

  async function getRemainingTime() {
    const contractInstance = await getContractInstance();
    const time = await contractInstance.getRemainingTime();

    return parseInt(time, 16);
  }

  async function getCurrentStatus(): Promise<boolean> {
    const contractInstance = await getContractInstance();

    return await contractInstance.getVotingStatus();
  }

  async function canVote() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
    const voteStatus = await contractInstance.voters(await signer.getAddress());
    setCanVote(voteStatus);
  }

  async function vote() {
    const contractInstance = await getContractInstance();

    try {
      const tx = await contractInstance.vote(number);
      await tx.wait();
      await canVote();
    } catch (err) {
      notification.warning({ message: 'User denied transaction signature' });
    }
  }

  async function handleAccountsChanged(accounts: string[] | null) {
    if (accounts?.length && account !== accounts[0]) {
      setAccount(accounts[0]);
      await canVote();
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }

  async function connectToMetamask() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        await provider.getSigner().then((item) => setAccount(item.address));
        setIsConnected(true);
        notification.success({ message: 'You are connected to Metamask' });
        await canVote();
      } catch (err) {
        notification.error({ message: 'Something wrong' });
      }
    } else {
      notification.warning({ message: 'Metamask is not detected in the browser' });
    }
  }

  return (
    <div className="container">
      <Typography.Title level={1}>Decentralized voting application</Typography.Title>
      {
        isConnected
          ? (
              <VoteForm
                account={account}
                canVote={!alreadyVoted}
                candidates={candidates}
                isTimeRemaining={isTimeRemaining}
                number={number}
                remainingTime={remainingTime}
                voteFunction={vote}
                onChangeNumber={setNumber}
              />
            )
          : <Button onClick={connectToMetamask}>Login Metamask</Button>
      }
    </div>
  );
}

export default App;
