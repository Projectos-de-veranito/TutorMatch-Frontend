import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Course } from '../../course/types/Course';
import { User } from '../../user/types/User';
import TimeSlotSelectorBySection from '../../schedule/components/TimeSelectorBySection';
import { SemesterService } from '../services/SemesterService';
import { TutoringSession } from '../../tutoring/types/Tutoring';
import { TutoringService } from '../../tutoring/services/TutoringService';

// Props para el componente modal
interface CreateTutoringModalProps {
  visible: boolean;
  onHide: () => void;
  onSave: (tutoring: any) => void;
  currentUser: User;
}

const CreateTutoringModal: React.FC<CreateTutoringModalProps> = ({
  visible,
  onHide,
  onSave,
  currentUser
}) => {
  const toast = useRef<Toast>(null);

  // Estado para los semestres y cursos
  const [semesters, setSemesters] = useState<{ id: number; name: string; courses: Course[] }[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Estado del formulario
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [whatTheyWillLearn, setWhatTheyWillLearn] = useState<string>('');
  const [courseImage, setCourseImage] = useState<string | undefined>(undefined);
  const [imageUploaded, setImageUploaded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Franjas horarias y días de la semana
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayMapping: Record<string, number> = {
    'SUN': 0,
    'MON': 1,
    'TUE': 2,
    'WED': 3,
    'THU': 4,
    'FRI': 5,
    'SAT': 6
  };
  const morningTimeSlots = ['8-9', '9-10', '10-11', '11-12'];
  const afternoonTimeSlots = ['13-14', '14-15', '15-16', '16-17'];
  const eveningTimeSlots = ['18-19', '19-20', '20-21', '21-22'];
  const allTimeSlots = [...morningTimeSlots, ...afternoonTimeSlots, ...eveningTimeSlots];
  const [availableTimes, setAvailableTimes] = useState<{ [day: string]: { [timeSlot: string]: boolean } }>({});

  // Cargar los semestres desde el servicio
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const data = await SemesterService.getSemesters();
        setSemesters(data); // Guardar los semestres en el estado
      } catch (error) {
        console.error('Error fetching semesters:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los semestres.',
          life: 3000,
        });
      }
    };

    fetchSemesters();
  }, []);

  // Inicializar las franjas horarias
  useEffect(() => {
    initializeTimeSlots();
  }, []);

  // Verificar validez del formulario cuando cambian los valores
  useEffect(() => {
    checkFormValidity();
  }, [selectedSemester, selectedCourse, description, price, whatTheyWillLearn, courseImage, availableTimes]);

  // Inicializar slots de tiempo
  const initializeTimeSlots = () => {
    const times: { [day: string]: { [timeSlot: string]: boolean } } = {};
    for (let day of daysOfWeek) {
      times[day] = {};
      for (let timeSlot of allTimeSlots) {
        times[day][timeSlot] = false;
      }
    }
    setAvailableTimes(times);
  };

  // Manejar selección de semestre
  const onSemesterSelected = (semesterName: string) => {
    setSelectedSemester(semesterName);
    const selectedSemesterObj = semesters.find((sem) => sem.name === semesterName);
    setAvailableCourses(selectedSemesterObj ? selectedSemesterObj.courses : []);
    setSelectedCourse(null);
  };

  // Validar formulario
  const checkFormValidity = () => {
    const valid =
      selectedSemester !== '' &&
      selectedCourse !== null &&
      description !== '' &&
      price > 0 &&
      whatTheyWillLearn !== '' &&
      courseImage !== undefined &&
      areTimeSlotsSelected();

    setIsFormValid(valid);
  };

  // Verificar si hay slots de tiempo seleccionados
  const areTimeSlotsSelected = (): boolean => {
    for (let day of daysOfWeek) {
      for (let timeSlot of allTimeSlots) {
        if (availableTimes[day]?.[timeSlot]) {
          return true;
        }
      }
    }
    return false;
  };

  // Convertir los time slots seleccionados al nuevo formato de availableTimes
  const convertTimeSlotsToAvailableTimes = () => {
    const formattedAvailableTimes: { 
      dayOfWeek: number,
      availableHours: {
        start: string,
        end: string
      }[]
    }[] = [];

    // Objeto para agrupar horas por día
    const timesByDay: { [day: number]: { start: string, end: string }[] } = {};

    // Recorrer cada día y cada slot para agrupar las horas por día
    for (let day of daysOfWeek) {
      const dayNumber = dayMapping[day];
      timesByDay[dayNumber] = [];

      for (let timeSlot of allTimeSlots) {
        if (availableTimes[day]?.[timeSlot]) {
          // Obtener las horas de inicio y fin del formato "HH-HH"
          const [startHour, endHour] = timeSlot.split('-');
          
          timesByDay[dayNumber].push({
            start: `${startHour}:00`,
            end: `${endHour}:00`
          });
        }
      }
    }

    // Convertir el objeto agrupado al formato final
    for (const [dayNumber, hours] of Object.entries(timesByDay)) {
      if (hours.length > 0) {
        formattedAvailableTimes.push({
          dayOfWeek: parseInt(dayNumber),
          availableHours: hours
        });
      }
    }

    return formattedAvailableTimes;
  };

  // Manejar subida de archivo
  const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.size > 1024 * 1024) {
        setErrorMessage('El archivo es demasiado grande. El tamaño máximo permitido es de 1MB.');
        setImageUploaded(false);
        return;
      }

      if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          setCourseImage(e.target.result);
          setImageUploaded(true);
          setErrorMessage('');
        };
        reader.readAsDataURL(file);
      } else {
        setErrorMessage('Tipo de archivo inválido. Por favor, seleccione un archivo PNG o JPEG.');
        setImageUploaded(false);
      }
    }
  };

  // Función para manejar la creación de la tutoría
  const onConfirmAddTutoring = async () => {
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Convertir los time slots seleccionados al nuevo formato
      const formattedAvailableTimes = convertTimeSlotsToAvailableTimes();

      // Crear el objeto TutoringSession
      const newTutoring = new TutoringSession({
        tutorId: currentUser.id,
        courseId: selectedCourse?.id,
        title: selectedCourse?.name || '',
        description: description,
        price: price,
        whatTheyWillLearn: whatTheyWillLearn.split('\n').filter(item => item.trim() !== ''),
        imageUrl: courseImage || '',
        availableTimes: formattedAvailableTimes
      });

      // Guardar la tutoría
      const savedTutoring = await TutoringService.createTutoing(newTutoring);

      // Mostrar mensaje de éxito
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Tutoring session created successfully',
        life: 3000,
      });

      // Notificar al componente padre
      onSave(savedTutoring);
      
      // Cerrar el modal
      onHide();
      
      // Resetear el formulario
      resetForm();
    } catch (error) {
      console.error('Error creating tutoring session:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'There was an error creating the tutoring session',
        life: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear el formulario
  const resetForm = () => {
    setSelectedSemester('');
    setSelectedCourse(null);
    setDescription('');
    setPrice(0);
    setWhatTheyWillLearn('');
    setCourseImage(undefined);
    setImageUploaded(false);
    initializeTimeSlots();
  };

  const headerElement = (
    <div className="w-full flex justify-between items-center text-white">
      <h2 className="text-xl font-semibold">Add New Tutoring</h2>
      <button
        onClick={onHide}
        className="text-white bg-transparent hover:text-gray-400"
      >
        ✕
      </button>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        style={{ width: '95%', maxWidth: '600px' }}
        modal
        header={headerElement}
        footer={false}
        className="border-none shadow-xl"
        draggable={false}
        resizable={false}
        closable={false}
        contentClassName="bg-[#1f1f1f] text-white p-6"
      >
        <div className="space-y-6">
          {/* Selector de semestre */}
          <div>
            <h3 className="text-lg font-medium mb-4">Course semester</h3>
            <div className="grid grid-cols-4 gap-2">
              {semesters.map((semester) => (
                <button
                  key={semester.id}
                  onClick={() => onSemesterSelected(semester.name)}
                  className={`py-2 px-3 text-center border border-gray-600 rounded ${
                    selectedSemester === semester.name
                      ? 'bg-primary text-white'
                      : 'bg-[#1f1f1f] text-white hover:border-gray-400'
                  }`}
                >
                  {semester.name}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de curso */}
          <div>
            <h3 className="text-lg font-medium mb-4">Course name</h3>
            <Dropdown
              value={selectedCourse}
              options={availableCourses}
              onChange={(e) => setSelectedCourse(e.value)}
              optionLabel="name"
              placeholder="Select course name"
              className="w-full bg-[#1f1f1f] text-white border border-gray-600 rounded"
            />
          </div>

          {/* Descripción del curso */}
          <div>
            <h3 className="text-lg font-medium mb-4">Description</h3>
            <InputTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Enter your course description"
              className="w-full bg-[#1f1f1f] text-white border border-gray-600 rounded"
            />
          </div>

          {/* Precio del curso */}
          <div>
            <h3 className="text-lg font-medium mb-4">Price</h3>
            <div className="flex items-center">
              <span className="text-white mr-2">S/.</span>
              <input
                type="number"
                value={price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setPrice(value > 0 ? value : 0); // Asegurarse de que el valor sea mayor a 0
                }}
                min="0.01" // Mínimo permitido mayor a 0
                step="0.01" // Permitir decimales
                placeholder="Enter the price"
                className="w-full bg-[#1f1f1f] text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Imagen del curso */}
          <div>
            <h3 className="text-lg font-medium mb-4">Course image</h3>
            <div className="space-y-2">
              {/* Botón para subir archivos */}
              {!courseImage && (
                <div className="flex items-center space-x-4">
                  <label
                    htmlFor="file-upload"
                    className="block text-center text-sm text-white py-2 px-4 rounded bg-red-500 font-semibold cursor-pointer hover:bg-red-600"
                  >
                    Upload image
                  </label>
                  <span className="text-sm text-gray-400">Upload your course image</span>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={onFileUpload}
                className="hidden" // Ocultar el input
              />

              {/* Vista previa de la imagen subida */}
              {courseImage && (
                <div className="mt-3">
                  <img
                    src={courseImage}
                    alt="Course Image"
                    className="max-w-full h-auto max-h-48 rounded"
                  />
                  {/* Botón para eliminar la imagen */}
                  <button
                    onClick={() => {
                      setCourseImage(undefined);
                      setImageUploaded(false);
                      setErrorMessage('');
                    }}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove image
                  </button>
                </div>
              )}

              {/* Mensajes de éxito o error */}
              {imageUploaded && (
                <p className="text-sm text-green-500">Image uploaded successfully</p>
              )}
              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}
            </div>
          </div>

          {/* Qué aprenderán */}
          <div>
            <h3 className="text-lg font-medium mb-4">What will they learn</h3>
            <InputTextarea
              value={whatTheyWillLearn}
              onChange={(e) => setWhatTheyWillLearn(e.target.value)}
              rows={4}
              placeholder="Enter what will your future students will learn"
              className="w-full bg-[#1f1f1f] text-white border border-gray-600 rounded"
            />
            <p className="text-xs text-gray-400 mt-1">Separate each learning point with a new line</p>
          </div>
          
          {/* Available times - Ahora usando nuestro nuevo componente */}
          <div>
            <h3 className="text-lg font-medium mb-2">Your available times</h3>
            <p className="text-sm text-gray-400 mb-4">Click on time slots to mark your availability</p>

            {/* Aquí utilizamos nuestro nuevo componente por secciones */}
            <TimeSlotSelectorBySection
              days={daysOfWeek}
              initialSelectedSlots={availableTimes}
              onChange={(newSelectedSlots) => {
                setAvailableTimes(newSelectedSlots);
              }}
            />
          </div>

          {/* Botón para añadir tutoría */}
          <div className="flex justify-end pt-4">
            <button
              className={`px-4 py-2 rounded ${isFormValid ? 'bg-primary hover:bg-primary-hover' : 'bg-gray-700 cursor-not-allowed'} text-white`}
              onClick={onConfirmAddTutoring}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Tutoring'}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default CreateTutoringModal;