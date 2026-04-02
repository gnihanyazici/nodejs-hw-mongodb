import createHttpError from "http-errors";
import * as contactServices from "../services/contacts.js";

export const getContactsController = async (req, res) => {
  const { 
    page = 1, 
    perPage = 10, 
    sortBy = 'name', 
    sortOrder = 'asc',
    type,
    isFavourite
  } = req.query;

  const options = {
    page: parseInt(page, 10),
    perPage: parseInt(perPage, 10),
    sortBy,
    sortOrder,
    type,
    isFavourite
  };

  const userId = req.user._id; 
  const contactsData = await contactServices.getAllContacts(userId, options);

  res.json({
    status: 200,
    message: "Successfully found contacts!",
    data: contactsData,
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;

  const userId = req.user._id; 
  
  const contact = await contactServices.getContactById(contactId, userId);

  if (!contact) {
    throw createHttpError(404, "Contact not found");
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const userId = req.user._id; 
  
  const contactData = { ...req.body };

  if (req.file) {
    contactData.photo = req.file.path;
  }
  
  const contact = await contactServices.createContact(contactData, userId);

  res.status(201).json({
    status: 201,
    message: "Successfully created a contact!",
    data: contact,
  });
};

export const patchContactController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id; 
  
  const contactData = { ...req.body };

  if (req.file) {
    contactData.photo = req.file.path;
  }
  
  const result = await contactServices.updateContact(contactId, contactData, userId);

  if (!result) {
    throw createHttpError(404, "Contact not found");
  }

  res.json({
    status: 200,
    message: "Successfully patched a contact!",
    data: result,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id; 
  
  const contact = await contactServices.deleteContact(contactId, userId);

  if (!contact) {
    throw createHttpError(404, "Contact not found");
  }

  res.status(204).send();
};