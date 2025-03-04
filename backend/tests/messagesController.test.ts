import { describe, it, expect, beforeAll } from '@jest/globals';
import * as request from 'supertest'; /*ensures compatibility with the TypeScript compiler*/
import { app, startServer } from "../src/app";
import { Express } from 'express';

/*
    === Testing Messages APIs ===
*/
