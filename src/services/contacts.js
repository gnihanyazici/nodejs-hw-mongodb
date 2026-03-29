import { Contact } from '../db/models/contact.js'; 

export const getAllContacts = async (options = {}) => {
  const { 
    page = 1, 
    perPage = 10, 
    sortBy = 'name', 
    sortOrder = 'asc', 
    type, 
    isFavourite 
  } = options;

  const skip = (page - 1) * perPage;

  const filterQuery = {};
  if (type) {
    filterQuery.contactType = type;
  }
  if (isFavourite !== undefined) {
    filterQuery.isFavourite = isFavourite === 'true'; 
  }

  const sortQuery = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const totalItems = await Contact.countDocuments(filterQuery);
  const contacts = await Contact.find(filterQuery)
    .sort(sortQuery)
    .skip(skip)
    .limit(perPage);

  const totalPages = Math.ceil(totalItems / perPage);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  return {
    data: contacts,
    page,
    perPage,
    totalItems,
    totalPages,
    hasPreviousPage,
    hasNextPage
  };
};

export const getContactById = async (contactId) => {
  return await Contact.findById(contactId);
};

export const createContact = async (payload) => {
  return await Contact.create(payload);
};

export const updateContact = async (contactId, payload) => {
  return await Contact.findByIdAndUpdate(contactId, payload, { new: true });
};

export const deleteContact = async (contactId) => {
  return await Contact.findByIdAndDelete(contactId);
};