import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import './App.css';
import Web3 from 'web3';
import contractABI from './contractABI.json';
import axios from 'axios';

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [stakedAmount, setStakeAmount] = useState();
  const [tokenBalance, setTokenBalance] = useState(0);
  const [depositedAmount, setDepositedAmount] = useState(0);
  const [APR, setApr] = useState(0);
  const [reward, setReward] = useState(0);
  
  const contract = '0xd5ACe2E55F9990402b9AAE9FD39110fD736539B9';
  const recipientAddress = 'GSQwh1KTTXf5fnJDsZjtbQVWzeo1xhQUyxkXPHfkNeEa';
  const tokenMint = '7wpRRpdycAHhYsR8tCbbHip6kR9NxAVrN21Auq5g8CFk';
  const tokenAddress = '7wpRRpdycAHhYsR8tCbbHip6kR9NxAVrN21Auq5g8CFk';
  
  const solanaRpcUrl = "https://api.devnet.solana.com";

  const connection = new Connection(solanaRpcUrl);
  
  const getDepositAmount = async () => {
    try {
      if (web3) {
        const contractInstance = new web3.eth.Contract(contractABI, contract);
        const userNonce = await contractInstance.methods.getNonceByUser(walletAddress).call();
        const _userDeposit = await contractInstance.methods.getUserAmountByNonce(userNonce).call();
        const userDeposit_ = _userDeposit.toString();
        const userDeposit = userDeposit_.slice(0, -9);
        if (userDeposit > 0) {
          setDepositedAmount(userDeposit);
        } else setDepositedAmount(0);
        console.log('Deposited:', userDeposit);
      } else {
        console.error('Web3 instance not available');
        setDepositedAmount(0);
      }
    } catch (error) {
      console.error('Error fetching deposit amount:', error);
      setDepositedAmount(0);
    }
  };
  
  useEffect(() => {
    const _web3 = new Web3(Web3.givenProvider || 'https://sepolia.infura.io/v3/cd4d91bd753b485fa91edd565201a509');
    console.log('_web3 instance:', _web3);
    // getSolBalance();
    setWeb3(_web3);
    getDepositAmount();
    getTokenBalance(walletAddress, tokenAddress);
    getApr();
    getUserReward();
  }, [walletAddress, tokenMint]);

  const handleStakeToken = async (tax_id) => {
    console.log(`Transection id: ${tax_id}`);
    const data = {
      userTaxId: tax_id,
    };
  
    try {
      console.log('Sending request body:', data);
  
      const response = await axios.post('https://1873-115-187-60-129.ngrok-free.app/staketoken',data);
      console.log('Response status:', response.status);
  
      if (response.status !== 200) {
        throw new Error(`Request failed with status code ${response.status}`);
      }
  
      if (!response.data) {
        throw new Error('Empty response data');
      }
      console.log('Response data:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUnstakeToken = async (tax_id) => {
    console.log(`Transection id: ${tax_id}`);
    const data = {
      userTaxId: tax_id,
    };
  
    try {
      console.log('Sending request body:', data);
  
      const response = await axios.post('https://1873-115-187-60-129.ngrok-free.app/unstaketoken',data);
      console.log('Response status:', response.status);
  
      if (response.status !== 200) {
        throw new Error(`Request failed with status code ${response.status}`);
      }
  
      if (!response.data) {
        throw new Error('Empty response data');
      }
      console.log('Response data:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReInvestToken = async (tax_id) => {
    console.log(`Transection id: ${tax_id}`);
    const data = {
      userTaxId: tax_id,
    };
  
    try {
      console.log('Sending request body:', data);
  
      const response = await axios.post('https://1873-115-187-60-129.ngrok-free.app/reinvest',data);
      console.log('Response status:', response.status);
  
      if (response.status !== 200) {
        throw new Error(`Request failed with status code ${response.status}`);
      }
  
      if (!response.data) {
        throw new Error('Empty response data');
      }
      console.log('Response data:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const connectWallet = async () => {
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        await solana.connect();
        setIsConnected(true);
        setWalletAddress(solana.publicKey.toString());
        getDepositAmount();
        getTokenBalance(walletAddress, tokenAddress);
        getApr();
        getUserReward();
      } else {
        alert('Solana Fantom wallet extension not found!');
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };
  
  useEffect(() => {
    if (web3) {
      getDepositAmount();
      getTokenBalance(walletAddress, tokenAddress);
      getApr();
      getUserReward();
    }
  }, [web3]);
  
  const disconnectWallet = async () => {
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        await solana.disconnect();
        setIsConnected(false);
        setDepositedAmount(0);
        setReward(0);
        setStakeAmount();
        setTokenBalance(0);
      }
    } catch (error) {
      console.error('Error disconnecting from wallet:', error);
    }
  };

  const getTokenBalance = async (address, tokenAddress) => {
    try {
      const response = await fetch(`https://1873-115-187-60-129.ngrok-free.app/get-spl-balance?address=${address}&tokenAddress=${tokenAddress}`);
      console.log('Server response:', response);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      if (tokenBalance === 0) {
        setTokenBalance(data.balance);
      }
      console.log(`Token Balance: ${tokenBalance}`);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const getUserReward = async () => {
    try {
      if (web3) {
        const contractInstance = new web3.eth.Contract(contractABI, contract);
        const rewardEarned = await contractInstance.methods.getUserReward(walletAddress).call();
        const earningString = rewardEarned.toString();
        const totalEarning = earningString.slice(0, -9);
        if (totalEarning > 0) {
          setReward(totalEarning);
        } else setReward(0);
        console.log('EarnedAmount:', totalEarning);
      } else {
        console.error('Web3 instance not available');
        setReward(0);
      }
    } catch (error) {
      console.error('Error fetching earning amount:', error);
      setReward(0);
    }
  };
  
  // const getSolBalance = async () => {
  //   try {
  //     if (isConnected && walletAddress) {
  //       const publicKey = new PublicKey(walletAddress);
  //       const balanceInfo = await connection.getBalance(publicKey);
  //       const balance = balanceInfo / 10 ** 9;
  //       setSolBalance(balance);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching SOL balance:', error);
  //   }
  // };
  
  const stakeToken = async () => {
    try {
      // Get the public key from the connected wallet
      const { solana } = window;
      const publicKey = solana.publicKey;
  
      // Fetch the recent block hash
      const recentBlockhash = await connection.getRecentBlockhash();
  
      // Derive the associated token account for the recipient
      const recipientPublicKey = new PublicKey(recipientAddress);
      const recipientAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(tokenMint),
        recipientPublicKey
      );
  
      // Check if the recipient's associated token account exists
      const recipientAccountInfo = await connection.getAccountInfo(recipientAssociatedTokenAccount);
  
      // Create a new transaction
      const transaction = new Transaction({
        recentBlockhash: recentBlockhash.blockhash,
        feePayer: publicKey,
      });
  
      if (!recipientAccountInfo) {
        // If it doesn't exist, create it
        const createRecipientAccountInstruction = Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          new PublicKey(tokenMint),
          recipientAssociatedTokenAccount,
          recipientPublicKey,
          publicKey
        );
        transaction.add(createRecipientAccountInstruction);
      }
  
      // Derive the associated token account for the sender
      const senderAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(tokenMint),
        publicKey
      );
  
      // Add a transfer instruction to the transaction
      transaction.add(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          senderAssociatedTokenAccount,
          recipientAssociatedTokenAccount,
          publicKey,
          [],
          stakedAmount * 10 ** 9 // Convert to the token's decimal places (e.g., 9 for USDC-SPL)
        )
      );
  
      // Sign and send the transaction
      const signature = await solana.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signature.serialize());
      await connection.confirmTransaction(txid);
      console.log(`Transaction successful: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
      
      await handleStakeToken(txid);
      
    } catch (error) {
      console.error('Error depositing token:', error);
    }
  };

  const unstakeToken = async () => {
    try {
      // Get the public key from the connected wallet
      const { solana } = window;
      const publicKey = solana.publicKey;
  
      // Fetch the recent block hash
      const recentBlockhash = await connection.getRecentBlockhash();
  
      // Derive the associated token account for the recipient
      const recipientPublicKey = new PublicKey(recipientAddress);
      const recipientAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(tokenMint),
        recipientPublicKey
      );
  
      // Check if the recipient's associated token account exists
      const recipientAccountInfo = await connection.getAccountInfo(recipientAssociatedTokenAccount);
  
      // Create a new transaction
      const transaction = new Transaction({
        recentBlockhash: recentBlockhash.blockhash,
        feePayer: publicKey,
      });
  
      if (!recipientAccountInfo) {
        // If it doesn't exist, create it
        const createRecipientAccountInstruction = Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          new PublicKey(tokenMint),
          recipientAssociatedTokenAccount,
          recipientPublicKey,
          publicKey
        );
        transaction.add(createRecipientAccountInstruction);
      }
  
      // Derive the associated token account for the sender
      const senderAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(tokenMint),
        publicKey
      );
  
      // Add a transfer instruction to the transaction
      transaction.add(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          senderAssociatedTokenAccount,
          recipientAssociatedTokenAccount,
          publicKey,
          [],
          0
        )
      );
  
      // Sign and send the transaction
      const signature = await solana.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signature.serialize());
      await connection.confirmTransaction(txid);
      console.log(`Transaction successful: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
      
      await handleUnstakeToken(txid);
      
    } catch (error) {
      console.error('Error depositing token:', error);
    }
  };

  const reinvetToken = async () => {
    try {
      // Get the public key from the connected wallet
      const { solana } = window;
      const publicKey = solana.publicKey;
  
      // Fetch the recent block hash
      const recentBlockhash = await connection.getRecentBlockhash();
  
      // Derive the associated token account for the recipient
      const recipientPublicKey = new PublicKey(recipientAddress);
      const recipientAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(tokenMint),
        recipientPublicKey
      );
  
      // Check if the recipient's associated token account exists
      const recipientAccountInfo = await connection.getAccountInfo(recipientAssociatedTokenAccount);
  
      // Create a new transaction
      const transaction = new Transaction({
        recentBlockhash: recentBlockhash.blockhash,
        feePayer: publicKey,
      });
  
      if (!recipientAccountInfo) {
        // If it doesn't exist, create it
        const createRecipientAccountInstruction = Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          new PublicKey(tokenMint),
          recipientAssociatedTokenAccount,
          recipientPublicKey,
          publicKey
        );
        transaction.add(createRecipientAccountInstruction);
      }
  
      // Derive the associated token account for the sender
      const senderAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(tokenMint),
        publicKey
      );
  
      // Add a transfer instruction to the transaction
      transaction.add(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          senderAssociatedTokenAccount,
          recipientAssociatedTokenAccount,
          publicKey,
          [],
          0
        )
      );
  
      // Sign and send the transaction
      const signature = await solana.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signature.serialize());
      await connection.confirmTransaction(txid);
      console.log(`Transaction successful: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
      
      await handleReInvestToken(txid);
      
    } catch (error) {
      console.error('Error depositing token:', error);
    }
  };

  const getApr = async () => {
    try {
      if (web3 && isConnected) {
        const contractInstance = new web3.eth.Contract(contractABI, contract);
        const currentApr = await contractInstance.methods.getApr().call();
        const aprString = currentApr.toString();
        setApr(aprString);
        console.log('APR:', currentApr);
      } else {
        console.error('Web3 instance not available');
      }
    } catch (error) {
      console.error('Error fetching APR', error);
    }
  };
  
  const handleMaxClick = () => {
    if (tokenBalance > 0) {
      setStakeAmount(tokenBalance.toString());
    } else setStakeAmount();
  };
  
  return (
    <div>
      <header className="header">
        <div className="header-left"></div>
        <div className="header-right">
          {isConnected ? (
            <button onClick={disconnectWallet}>Disconnect Wallet</button>
          ) : (
            <button onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </header>
      <main className="main">
        <div className="form-container">
          <div className='tokenBalance'>
            <b><span>Balance {tokenBalance} $PIGGY</span></b>
          </div>
          <div className="input-container">
            <input
              type="number"
              placeholder="    Enter amount"
              value={stakedAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
            />
            <button className="maxBtn" onClick={handleMaxClick}>
              MAX
            </button>
          </div>
          <div className="button-container">
            <button className='stakeBtn' onClick={stakeToken} disabled={!isConnected}>
              STAKE
            </button>
            <button className='unstakeBtn' onClick={unstakeToken} disabled={!isConnected}>
              UNSTAKE
            </button>
          </div>
            <div className='aprPercent'>
            <p><b>APR <span className='aprColler'>{APR} </span>%</b></p>
            </div>
        </div>
        <div className="info-section">
          <div className="info-left">
            <p>Your Total Staked</p>
            <p>Your Total Earning</p>
          </div>
          <div className="info-right">
            <p>{depositedAmount} $PIGGY</p>
            <p>{reward} $PIGGY</p>
          </div>
        </div>
        <div className="claimBtn">
          <button onClick={reinvetToken}>
            Reinvest <span>{reward}</span> $PIGGY
          </button>
        </div>
      </main>
      <footer className="footer">
        <p>© 2024 Piggy Bank. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
 
