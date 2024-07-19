import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

function App() {
  const [notes, setNotes] = useState([]);
  const [isNotesPagesVisible, setIsNotesPagesVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Thêm trạng thái tìm kiếm

  useEffect(() => {
    (async () => {
      const { data } = await axios.get(`http://localhost:3000/notes`);
      setNotes(data);
    })();
  }, []);

  const onHandleDelete = async (id) => {
    try {
      const confirm = window.confirm("Bạn có chắc muốn xoá ?");
      if (confirm) {
        await axios.delete(`http://localhost:3000/notes/${id}`);
        alert('Xoá thành công');
        setNotes(notes.filter(note => note.id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  const onHandleAdd = async (note) => {
    try {
      note.date = new Date().toLocaleString(); // Thêm dòng này để cập nhật ngày giờ hiện tại
      const { data } = await axios.post(`http://localhost:3000/notes`, note);
      alert("Thêm thành công");
      reset();
      setIsNotesPagesVisible(false);
      setNotes([...notes, data]);
    } catch (error) {
      console.log(error);
    }
  };

  const onHandleUpdate = async (note) => {
    try {
      // Giữ nguyên giá trị date của ghi chú cũ
      const noteToUpdate = { ...note, date: currentNote.date }; 
      const { data } = await axios.put(`http://localhost:3000/notes/${note.id}`, noteToUpdate);
      alert("Cập nhật thành công");
      setNotes(notes.map(n => (n.id === note.id ? data : n)));
      reset();
      setCurrentNote(null);
      setIsNotesPagesVisible(false);
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    const thumbtackIcons = document.querySelectorAll('.fa-thumbtack');
    thumbtackIcons.forEach(icon => {
      icon.addEventListener('click', handleThumbtackClick);
    });

    return () => {
      thumbtackIcons.forEach(icon => {
        icon.removeEventListener('click', handleThumbtackClick);
      });
    };
  }, [isNotesPagesVisible]);

  const handleThumbtackClick = (e) => {
    const icon = e.target;
    const noteContainer = icon.closest('.border');
    noteContainer.parentElement.prepend(noteContainer);
    icon.classList.toggle('text-blue-500');
  };

  const handleAddButtonClick = () => {
    setCurrentNote(null); // Khi nhấn nút thêm mới, reset currentNote
    setIsNotesPagesVisible(!isNotesPagesVisible);
  };

  const handleDeleteButtonClick = () => {
    setIsNotesPagesVisible(false);
  };

  const handleEditButtonClick = (note) => {
    setCurrentNote(note); // Đặt ghi chú hiện tại vào trạng thái
    setValue('title', note.title);
    setValue('content', note.content);
    setValue('tags', note.tags);
    setIsNotesPagesVisible(true);
  };

  const onSubmit = (data) => {
    if (currentNote) {
      // Nếu đang chỉnh sửa, gọi hàm cập nhật
      onHandleUpdate({ ...currentNote, ...data });
    } else {
      // Nếu đang thêm mới, gọi hàm thêm mới
      onHandleAdd(data);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Lọc danh sách ghi chú theo từ khóa tìm kiếm
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="title">
              <h1 className="text-xl font-semibold text-gray-800">Notes</h1>
            </div>
            <div className="search flex items-center">
              <form action="#" className="relative">
                <input
                  type="text"
                  className="border-2 border-gray-300 bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-none"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange} // Thêm hàm xử lý tìm kiếm
                />
                <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
                  <i className="fas fa-search text-gray-400" />
                </button>
              </form>
            </div>
            <div className="user flex items-center">
              <button>
                <i className="fas fa-user text-gray-400 text-lg ml-2" />
                <i className="fas fa-angle-down text-gray-400 text-lg ml-2" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <div
        id="Add_notes"
        className="Add notes flex items-center justify-center space-x-2 fixed shadow-xl right-2 bottom-2"
      >
        <button
          id="addButton"
          className="p-2 rounded-lg py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white focus:outline-none"
          onClick={handleAddButtonClick}
        >
          <i className="fa-solid fa-plus" />
        </button>
      </div>
      <section
        id="notesPages"
        className={`notes_pages w-[1000px] ${isNotesPagesVisible ? 'show' : 'hidden'}`}
      >
        <div className="container flex items-center justify-center h-screen">
          <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <div className="flex justify-between">
                  <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                    TITLE
                  </label>
                  <i
                    id="deleteButton"
                    className="fa-solid fa-xmark delete cursor-pointer"
                    onClick={handleDeleteButtonClick}
                  />
                </div>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="font-bold appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter title"
                  {...register(`title`, { required: true })}
                />
                {errors.title && errors.title.type === "required" && (<div className='text-red-700'>không được bỏ trống</div>)}
              </div>
              <div className="mb-4">
                <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">
                  CONTENT
                </label>
                <textarea
                  id="content"
                  name="content"
                  className="appearance-none bg-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={5}
                  placeholder="Enter content"
                  {...register(`content`, { required: true })}
                />
                {errors.content && errors.content.type === "required" && (<div className='text-red-700'>không được bỏ trống</div>)}
              </div>
              <div className="mb-6">
                <label htmlFor="tags" className="block text-gray-700 text-sm font-bold mb-2">
                  TAGS
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter tags"
                  {...register(`tags`, { required: true })}
                />
                {errors.tags && errors.tags.type === "required" && (<div className='text-red-700'>không được bỏ trống</div>)}
              </div>
              <div className="hidden">
                <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">
                  DATE
                </label>
                <input
                  type="text"
                  id="date"
                  name="date"
                  className="appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter date"
                  {...register(`date`)}
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {currentNote ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <section className="main mt-10 container mx-auto">
        <div className="container grid grid-cols-3 gap-5">
          {filteredNotes.map((note, index) => (
            <div key={index + 1} className="border p-3 shadow-lg rounded-md">
              <h4 className="font-bold text-[18px]">{note.title}</h4>
              <div className="flex justify-between">
                <span className="text-[14px]">{note.date}</span>
                <i className="fa-solid fa-thumbtack active:text-green focus:text-green" />
              </div>
              <div>
                <p>{note.content}</p>
              </div>
              <div className="flex justify-between">
                <span className='font-semibold'>#{note.tags}</span>
                <div>
                  <i
                    className="fa-solid fa-pencil mr-2 cursor-pointer editButton"
                    onClick={() => handleEditButtonClick(note)}
                  />
                  <i className="fa-regular fa-trash-can cursor-pointer" onClick={() => onHandleDelete(note.id)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
