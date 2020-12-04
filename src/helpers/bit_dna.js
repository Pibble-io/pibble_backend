import http from 'http';
import fs from 'fs';
import Path from 'path';
import FormData from 'form-data';
import jwt from "jsonwebtoken";
import config from '../config';
import axios from 'axios';
const { BIT_DNA_API_HOST: bitDNAHost, BIT_DNA_API_PORT: bitDNAPort } = process.env;

const checkHashes = async (mediaHases, address, balance, pibPerHashBitDna, user_id) => {
  let bitDNAResult;

  try {
    bitDNAResult = JSON.parse(await _checkNewHashesRequest(mediaHases, address, balance, pibPerHashBitDna, user_id));
  } catch (err) {
    console.log(err);
    throw new Error("Opps...Something went wrong with bitDNA...");
  }
  if (bitDNAResult.message) {
    throw new Error(bitDNAResult.message);
  }

  return bitDNAResult;
}

const createSaleContract = async (mediaHases, address, commerce_id, user_id) => {
  let bitDNAResult;

  try {
    bitDNAResult = JSON.parse(await _createSaleContractRequest(mediaHases, address, commerce_id, user_id));
  } catch (err) {
    console.log(err);
    throw new Error("Opps...Something went wrong with bitDNA...");
  }
  if (bitDNAResult.message) {
    throw new Error(bitDNAResult.message);
  }

  return bitDNAResult;
}

const getSaleContract = async (commerce_id, user_id) => {
  let bitDNAResult;

  try {
    bitDNAResult = JSON.parse(await _getSaleContractRequest(commerce_id, user_id));
  } catch (err) {
    console.log(err);
    throw new Error("Opps...Something went wrong with bitDNA...");
  }
  if (bitDNAResult.message) {
    throw new Error(bitDNAResult.message);
  }

  return bitDNAResult;
}

const _getSaleContractRequest = (commerce_id, owner_id) => new Promise((resolve, reject) => {
  const post_data = JSON.stringify({
    commerce_id
  })

  const token = jwt.sign({ id: owner_id }, config.JWT_ACCESS_SECRET)
  let headers = {
    'Content-Type': 'application/json',
    'Content-Length': post_data.length,
    'Authorization': `Bearer ${token}`
  }

  const request = http.request({
    method: 'post',
    host: bitDNAHost,
    port: bitDNAPort,
    path: '/contract/check-status',
    headers: headers
  });

  request.write(post_data);
  request.end();

  request.on('response', res => {
    res.on('data', resolve)
  });
  request.on('error', reject)
})

const _createSaleContractRequest = (hashes, address, commerce_id, owner_id) => new Promise((resolve, reject) => {
  const post_data = JSON.stringify({
    hashes,
    address,
    commerce_id
  })

  const token = jwt.sign({ id: owner_id }, config.JWT_ACCESS_SECRET)
  let headers = {
    'Content-Type': 'application/json',
    'Content-Length': post_data.length,
    'Authorization': `Bearer ${token}`
  }

  const request = http.request({
    method: 'post',
    host: bitDNAHost,
    port: bitDNAPort,
    path: '/contract',
    headers: headers
  });

  request.write(post_data);
  request.end();

  request.on('response', res => {
    res.on('data', resolve)
  });
  request.on('error', reject)
})

const _checkNewHashesRequest = (hashes, address, balance, pibPerHashBitDna, owner_id) => new Promise((resolve, reject) => {
  const post_data = JSON.stringify({
    hashes,
    address,
    balance,
    owner_id,
    price_per_image: pibPerHashBitDna
  })

  const token = jwt.sign({ id: owner_id }, config.JWT_ACCESS_SECRET)
  let headers = {
    'Content-Type': 'application/json',
    'Content-Length': post_data.length,
    'Authorization': `Bearer ${token}`
  }

  const request = http.request({
    method: 'post',
    host: bitDNAHost,
    port: bitDNAPort,
    path: '/hash/check',
    headers: headers
  });

  request.write(post_data);
  request.end();

  request.on('response', res => {
    res.on('data', resolve)
  });
  request.on('error', reject)
})

export default {
  checkHashes,
  createSaleContract,
  getSaleContract
};