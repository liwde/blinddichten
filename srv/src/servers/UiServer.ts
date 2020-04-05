import express from 'express';
import { UI_PATH } from '../config';
import { Server } from './Server';

export class UiServer {
  constructor(private server: Server) {
    this.server.app.use(express.static(UI_PATH));
  }
}
