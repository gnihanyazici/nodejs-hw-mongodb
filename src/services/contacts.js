import { Contact } from '../db/models/contact.js'; 

export const getAllContacts = async () => {
  return await Contact.find();
};

export const getContactById = async (contactId) => {
  return await Contact.findById(contactId);
};

export const createContact = async (payload) => {
  return await Contact.create(payload);
};

export const updateContact = async (contactId, payload) => {
  // { new: true } güncellenmiş belgeyi döndürmesini sağlar
  return await Contact.findByIdAndUpdate(contactId, payload, { new: true });
};

export const deleteContact = async (contactId) => {
  return await Contact.findByIdAndDelete(contactId);
};