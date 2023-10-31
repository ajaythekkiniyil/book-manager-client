import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { apiUrl } from './constant'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

function App() {
   const [modalAddNewBook, setmodalAddNewBook] = useState(false);
   const [modalEditBook, setmodalEditBook] = useState(false);
   const [books, setBooks] = useState([])
   const [populatedBook, setPopulatedBookData] = useState({})
   const [newBook, setNewBook] = useState(null)
   const [reload, setReload] = useState(false)
   const toggle = () => { setmodalAddNewBook(!modalAddNewBook), setNewBook(null) };
   const toggleEditModal = () => setmodalEditBook(!modalEditBook);

   const getAllBooks = async () => {
      await fetch(`${apiUrl}/get-all-books`)
         .then(resp => resp.json())
         .then(data => { setBooks(data), setReload(false) })
         .catch((err) => alert('something wrong!'))
   }

   useEffect(() => {
      getAllBooks()
   }, [])

   useEffect(() => {
      if (reload) {
         getAllBooks()
      }
   }, [reload])

   const storeNewBook = (e) => {
      const name = e.target.name
      const value = e.target.value

      setNewBook(prevS => (
         {
            ...prevS,
            [name]: value
         }
      ))
   }

   const handleAddBook = async () => {
      await fetch(`${apiUrl}/create-book`, {
         method: 'POST',
         body: JSON.stringify(newBook),
         headers: {
            "Content-type": "application/json"
         }
      })
         .then(resp => resp.json())
         .then(data => {
            if (data.status) {
               setBooks(prevS => ([...prevS, newBook]))
               toggle()
               setNewBook(null)
               setReload(true)
            }
         })
         .catch(err => {
            alert('Please fill Book details')
         })
   }

   const handleDelete = async (bookId) => {
      let resp;
      if (confirm("Are you sure want to delete") == true) {
         resp = true
      } else {
         resp = false
      }

      if (resp) {
         await fetch(`${apiUrl}/delete-book/${bookId}`, {
            method: 'DELETE',
         })
            .then(resp => resp.json())
            .then(data => {
               if (data.status) {
                  getAllBooks()
               }
            })
            .catch(err => {
               alert('something went wrong')
            })

      }
   }

   const handleEdit = (bookId) => {
      toggleEditModal()
      const populateBookDetails = async () => {
         await fetch(`${apiUrl}/get-book-details/${bookId}`)
            .then(resp => resp.json())
            .then(data => {
               if (data.status) {
                  setPopulatedBookData(data.book)
               }
            })
            .catch(err => {
               setmodalEditBook(false)
               alert('something went wrong')
            })
      }
      populateBookDetails()
   }

   const storeEditedBookData = (e) => {
      const { name, value } = e.target
      setPopulatedBookData(prevS => (
         {
            ...prevS,
            [name]: value
         }
      ))
   }

   const handleUpdateBook = async(bookId) => {
      // updated values are present in populatedBook
      await fetch(`${apiUrl}/update-book/${bookId}`, {
         method: 'PUT',
         body: JSON.stringify(populatedBook),
         headers: {
            "Content-type": "application/json"
         }
      })
         .then(resp => resp.json())
         .then(data => {
            if (data.status) {
               toggleEditModal()
               setReload(true)
            }
         })
         .catch(err => {
            alert('Please fill Book details')
         })
   }

   return (
      <section>
         <div className='top-bar'>
            <h2>Book Manager</h2>
            <p className='add-book' onClick={toggle}>Add new book</p>
         </div>
         <table>
            <thead>
               <tr>
                  <td>Book Title</td>
                  <td>Author</td>
                  <td>Summary</td>
                  <td>Actions</td>
               </tr>
            </thead>
            <tbody>
               {
                  books && books.map(eachBook => {
                     return (
                        <tr key={eachBook._id}>
                           <td>{eachBook.title}</td>
                           <td>{eachBook.author}</td>
                           <td>{eachBook.summary}</td>
                           <td>
                              <span onClick={() => handleEdit(eachBook._id)}>Edit</span>
                              <span onClick={() => handleDelete(eachBook._id)}>Delete</span>
                           </td>
                        </tr>
                     )
                  })
               }
            </tbody>
         </table>
         {/* modal for add new book */}
         <Modal isOpen={modalAddNewBook} toggle={toggle}>
            <ModalHeader toggle={toggle}>Add new book</ModalHeader>
            <ModalBody>
               <input type="text" name='title' placeholder='Enter book title' onChange={storeNewBook} />
               <input type="text" name='author' placeholder='Enter author name' onChange={storeNewBook} />
               <input type="text" name='summary' placeholder='Enter book summary' onChange={storeNewBook} />
            </ModalBody>
            <ModalFooter>
               <Button color="primary" onClick={handleAddBook}>
                  Add new book
               </Button>{' '}
               <Button color="secondary" onClick={toggle}>
                  Cancel
               </Button>
            </ModalFooter>
         </Modal>

         {/* modal for edit book */}
         {
            populatedBook &&
            <Modal isOpen={modalEditBook} toggle={toggleEditModal}>
               <ModalHeader toggle={toggleEditModal}>Edit book details</ModalHeader>
               <ModalBody>
                  <input type="text" name='title' value={populatedBook.title} placeholder='Enter book title' onChange={storeEditedBookData} />
                  <input type="text" name='author' value={populatedBook.author} placeholder='Enter author name' onChange={storeEditedBookData} />
                  <input type="text" name='summary' value={populatedBook.summary} placeholder='Enter book summary' onChange={storeEditedBookData} />
               </ModalBody>
               <ModalFooter>
                  <Button color="primary" onClick={()=>handleUpdateBook(populatedBook._id)}>
                     Update
                  </Button>{' '}
                  <Button color="secondary" onClick={toggleEditModal}>
                     Cancel
                  </Button>
               </ModalFooter>
            </Modal>
         }
      </section>
   )
}

export default App
