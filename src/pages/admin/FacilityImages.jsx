import { useEffect, useRef, useState } from 'react';

import { errorMessage, fieldErrors } from '../../api/errors';
import { deleteFacilityImage, uploadFacilityImage } from '../../api/facilities';

const ACCEPT = 'image/jpeg,image/png';

function uploadError(error) {
  return fieldErrors(error).image ?? errorMessage(error);
}

/**
 * Upload zone and previews of a saved facility. Uploads and deletes hit the
 * API at once and are independent of the drawer's form.
 * @param {{facility: Object, onChanged: function}} props `onChanged` runs after
 *     every successful upload or delete
 */
export default function FacilityImages({ facility, onChanged }) {
  const [images, setImages] = useState(facility.images ?? []);
  const [uploading, setUploading] = useState(null);
  const [deleting, setDeleting] = useState(() => new Set());
  const [errors, setErrors] = useState([]);
  const [dragging, setDragging] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  function addError(text) {
    setErrors((current) => [...current, text]);
  }

  async function uploadAll(files) {
    if (files.length === 0 || busy.current) {
      return;
    }
    busy.current = true;
    setErrors([]);
    for (const file of files) {
      // Closing the drawer stops the files not sent yet.
      if (!mounted.current) {
        return;
      }
      setUploading(file.name);
      try {
        const image = await uploadFacilityImage(facility.id, file);
        setImages((current) => [...current, image]);
        onChanged();
      } catch (error) {
        addError(`${file.name}: ${uploadError(error)}`);
      }
    }
    setUploading(null);
    busy.current = false;
  }

  function onPick(event) {
    const files = Array.from(event.target.files);
    event.target.value = '';
    uploadAll(files);
  }

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    uploadAll(Array.from(event.dataTransfer.files));
  }

  async function remove(image, number) {
    setDeleting((current) => new Set(current).add(image.id));
    try {
      await deleteFacilityImage(facility.id, image.id);
      setImages((current) => current.filter((item) => item.id !== image.id));
      onChanged();
    } catch (error) {
      addError(`Imaginea ${number}: ${errorMessage(error)}`);
    } finally {
      setDeleting((current) => {
        const next = new Set(current);
        next.delete(image.id);
        return next;
      });
    }
  }

  return (
    <>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col gap-2 rounded-[12px] border border-dashed border-bordura p-6 focus-within:ring-2 focus-within:ring-principala ${
          dragging ? 'bg-[#eaf0ff] ring-2 ring-principala' : ''
        }`}
      >
        <input
          type="file"
          accept={ACCEPT}
          multiple
          aria-label="Adaugă imagini"
          onChange={onPick}
          className="sr-only"
        />
        <span className="text-base font-bold text-principala">
          ↑ Trage imaginile aici
        </span>
        <span className="text-sm text-text-secundar">
          sau selectează imagini · JPG, PNG · cel mult 5 MB · până la 5 imagini
        </span>
      </label>
      <p className="text-sm text-text-secundar">
        Imaginile se salvează imediat, fără „Salvează facilitatea”.
      </p>
      {uploading && (
        <p role="status" className="text-sm text-text-secundar">
          Se încarcă {uploading}…
        </p>
      )}
      {errors.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1 text-sm text-red-700">
          {errors.map((text, index) => (
            <li key={index}>{text}</li>
          ))}
        </ul>
      )}
      {images.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <li key={image.id} className="flex w-32 flex-col gap-1">
              <img
                src={image.url}
                alt={`Imaginea ${index + 1} a facilității ${facility.name}`}
                className="h-[72px] w-32 rounded-[10px] object-cover"
              />
              {index === 0 && (
                <span className="text-xs text-text-secundar">Miniatură</span>
              )}
              <button
                type="button"
                aria-label={`Șterge imaginea ${index + 1}`}
                disabled={deleting.has(image.id)}
                onClick={() => remove(image, index + 1)}
                className="self-start text-sm text-red-700 disabled:opacity-50"
              >
                × Șterge
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
