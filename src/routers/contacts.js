import { Router } from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
  getContactsController,
  getContactByIdController,
  createContactController,
  patchContactController,
  deleteContactController,
} from "../controllers/contacts.js";

import validateBody from "../middlewares/validateBody.js";
import isValidId from "../middlewares/isValidId.js";
import { createContactSchema, updateContactSchema } from "../schemas/contacts.js";

const router = Router();

router.get("/", ctrlWrapper(getContactsController));

router.get("/:contactId", isValidId, ctrlWrapper(getContactByIdController));
router.delete("/:contactId", isValidId, ctrlWrapper(deleteContactController));

router.post(
  "/", 
  validateBody(createContactSchema), 
  ctrlWrapper(createContactController)
);

router.patch(
  "/:contactId", 
  isValidId, 
  validateBody(updateContactSchema), 
  ctrlWrapper(patchContactController)
);

export default router;