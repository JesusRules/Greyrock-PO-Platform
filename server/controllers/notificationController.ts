import { Request, Response } from 'express';
import { createNoCacheHeaders } from 'server/utils/noCacheResponse.js';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications: any[] = [];

    res
      .status(200)
      .set(createNoCacheHeaders())
      .json({ message: 'Filtered BCRs found', notifications });
  } catch (error) {
    console.error('❌ Error fetching filtered BCRs:', error);
    res
      .status(500)
      .set(createNoCacheHeaders())
      .json({ message: 'Error fetching BCRs', error });
  }
};
