import { Router } from 'express';
import {
  getProfile, updateProfile, listUsers, activateUser, suspendUser,
  getAddresses, addAddress, updateAddress, deleteAddress
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { updateProfileSchema, addressSchema } from '../validations/user.validation.js';

const router = Router();

router.use(authenticate);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', validateRequest(updateProfileSchema), updateProfile);

// Address routes
router.get('/addresses', getAddresses);
router.post('/addresses', validateRequest(addressSchema), addAddress);
router.put('/addresses/:id', validateRequest(addressSchema), updateAddress);
router.delete('/addresses/:id', deleteAddress);

// Admin only routes
router.get('/', authorizeRole('admin'), listUsers);
router.patch('/:id/activate', authorizeRole('admin'), activateUser);
router.patch('/:id/suspend', authorizeRole('admin'), suspendUser);

export default router;