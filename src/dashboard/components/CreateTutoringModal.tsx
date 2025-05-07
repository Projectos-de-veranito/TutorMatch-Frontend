import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Course } from '../../course/types/Course';
import { User } from '../../user/types/User';
import TimeSlotSelectorBySection from '../../schedule/components/TimeSelectorBySection';
import { SemesterService } from '../services/SemesterService';
import { TutoringService } from '../../tutoring/services/TutoringService';
import { TutoringImageService } from '../../tutoring/services/TutoringImageService';

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
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
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

  // Convertir los time slots seleccionados al formato correcto para la API
    // Actualiza la función convertTimeSlotsToApiFormat
  const convertTimeSlotsToApiFormat = () => {
    const availableTimesArray = [];
  
    // Recorrer cada día y cada slot
    for (let day of daysOfWeek) {
      const dayNumber = dayMapping[day];
  
      for (let timeSlot of allTimeSlots) {
        if (availableTimes[day]?.[timeSlot]) {
          // Obtener las horas de inicio y fin del formato "HH-HH"
          const [startHour, endHour] = timeSlot.split('-');
          
          // Mantener el formato snake_case para disponibilidad de horarios
          // El servicio ya se encargará de la conversión adecuada
          availableTimesArray.push({
            day_of_week: dayNumber,
            start_time: `${startHour}:00`,
            end_time: `${endHour}:00`
          });
        }
      }
    }
  
    return availableTimesArray;
  };

  // Manejar subida de archivo
  const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('El archivo es demasiado grande. El tamaño máximo permitido es de 5MB.');
        setImageUploaded(false);
        return;
      }

      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'].includes(file.type)) {
        setErrorMessage('Tipo de archivo inválido. Por favor, seleccione un archivo PNG, JPEG, GIF o WebP.');
        setImageUploaded(false);
        return;
      }

      // Guardar el archivo original para subirlo después
      setOriginalFile(file);

      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = (e: any) => {
        setCourseImage(e.target.result);
        setImageUploaded(true);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Reemplaza la función onConfirmAddTutoring con esta implementación
  // Reemplaza la función onConfirmAddTutoring con esta implementación
  const onConfirmAddTutoring = async () => {
    if (!isFormValid || isSubmitting) return;
  
    try {
      setIsSubmitting(true);
  
      // Verificar que tenemos un course_id válido
      if (!selectedCourse?.id) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Por favor selecciona un curso válido',
          life: 3000,
        });
        setIsSubmitting(false);
        return;
      }
  
      // Convertir la lista de lo que aprenderán a formato compatible
      const learningPoints = whatTheyWillLearn
        .split('\n')
        .filter(item => item.trim() !== '')
        .map(item => item.trim());
  
      // Convertir los horarios disponibles al formato correcto
      const availableTimesArray = convertTimeSlotsToApiFormat();
  
      // Crear el objeto para enviar a la API
      const tutoringPayload = {
        tutor_id: currentUser.id.toString(),
        course_id: selectedCourse.id.toString(),
        title: selectedCourse.name || '',
        description: description,
        price: Number(price),
        what_they_will_learn: learningPoints,
        image_url: '',
        // Incluimos los availableTimes que el servicio manejará correctamente
        availableTimes: availableTimesArray
      };
  
      console.log("Preparando datos para tutoría:", tutoringPayload);
  
      // Usar el servicio para crear la tutoría con todos sus datos
      // El servicio ya maneja la conversión de formatos y la creación de horarios
      const savedTutoring = await TutoringService.createTutoring(tutoringPayload);
      console.log("Tutoría creada:", savedTutoring);
      
      // Si tenemos un archivo de imagen, subirlo y actualizar la tutoría
      if (originalFile && savedTutoring?.id) {
        try {
          setUploadingImage(true);
          
          toast.current?.show({
            severity: 'info',
            summary: 'Subiendo imagen',
            detail: 'La tutoría ha sido creada. Subiendo imagen...',
            life: 5000,
          });
          
          // Subir la imagen usando el servicio existente
          const imageUrl = await TutoringImageService.uploadTutoringImage(
            savedTutoring.id, 
            originalFile
          );
          
          // Si se subió correctamente, actualizar la tutoría
          if (imageUrl) {
            // Actualizar la tutoría con la URL de la imagen (el servicio maneja la conversión de formatos)
            await TutoringService.updateTutoring(savedTutoring.id, {
              image_url: imageUrl
            });
            
            // Actualizar el objeto guardado con la URL de la imagen
            savedTutoring.imageUrl = imageUrl;
            
            console.log("Imagen subida y tutoría actualizada con la URL:", imageUrl);
          }
        } catch (imageError) {
          console.error('Error al subir la imagen:', imageError);
          toast.current?.show({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'La tutoría se creó pero hubo un problema al subir la imagen.',
            life: 5000,
          });
        } finally {
          setUploadingImage(false);
        }
      }
  
      // Mostrar mensaje de éxito
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Tutoría creada correctamente',
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
      
      let errorMsg = 'Hubo un error al crear la tutoría.';
      
      // Mostrar un mensaje más específico si es posible
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response && 
          error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        errorMsg += ` ${error.response.data.message}`;
      }
      
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMsg,
        life: 5000,
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
    setOriginalFile(null);
    setImageUploaded(false);
    setErrorMessage('');
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
                    className={`block text-center text-sm text-white py-2 px-4 rounded bg-red-500 font-semibold cursor-pointer hover:bg-red-600 ${
                      uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Upload image
                  </label>
                  <span className="text-sm text-gray-400">Upload your course image</span>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                onChange={onFileUpload}
                className="hidden" // Ocultar el input
                disabled={uploadingImage}
              />

              {/* Vista previa de la imagen subida */}
              {courseImage && (
                <div className="mt-3 relative">
                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                      <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="#1f1f1f" animationDuration=".5s" />
                    </div>
                  )}
                  <img
                    src={courseImage}
                    alt="Course Image"
                    className="max-w-full h-auto max-h-48 rounded"
                  />
                  {/* Botón para eliminar la imagen */}
                  <button
                    onClick={() => {
                      setCourseImage(undefined);
                      setOriginalFile(null);
                      setImageUploaded(false);
                      setErrorMessage('');
                    }}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    disabled={uploadingImage}
                  >
                    Remove image
                  </button>
                </div>
              )}

              {/* Mensajes de éxito o error */}
              {imageUploaded && (
                <p className="text-sm text-green-500">Image ready to upload</p>
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
              className={`px-4 py-2 rounded ${isFormValid ? 'bg-primary hover:bg-primary-hover' : 'bg-gray-700 cursor-not-allowed'} text-white relative`}
              onClick={onConfirmAddTutoring}
              disabled={!isFormValid || isSubmitting || uploadingImage}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <ProgressSpinner style={{width: '20px', height: '20px'}} strokeWidth="4" fill="none" animationDuration=".5s" className="mr-2"/>
                  Adding...
                </span>
              ) : 'Add Tutoring'}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default CreateTutoringModal;