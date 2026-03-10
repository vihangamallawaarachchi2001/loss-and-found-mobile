import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { CalendarClock, Camera, Image as ImageIcon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

import { CreateReportInput } from '../../domain/types';
import { validateReportInput } from '../../utils/validation';

type Props = {
  typeLabel: 'Lost' | 'Found';
  onSubmit: (payload: CreateReportInput) => void;
  submitLabel: string;
};

const formatDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}`;
};

export default function ReportForm({ typeLabel, onSubmit, submitLabel }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [showPicker, setShowPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const payload: CreateReportInput = useMemo(
    () => ({
      title,
      description,
      location,
      eventAt: formatDateTime(eventDate),
      imageUri,
    }),
    [title, description, location, eventDate, imageUri],
  );

  const errors = validateReportInput(payload);

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const hasErrors = Object.values(errors).some(Boolean);

    if (hasErrors) {
      return;
    }

    onSubmit(payload);
    setTitle('');
    setDescription('');
    setLocation('');
    setImageUri(undefined);
    setEventDate(new Date());
    setSubmitted(false);
  };

  return (
    <View className="rounded-2xl bg-white p-5">
      <Text className="text-lg font-semibold text-slate-900">List a {typeLabel} Item</Text>

      <TextInput
        placeholder="Item title"
        placeholderTextColor="#94a3b8"
        value={title}
        onChangeText={setTitle}
        className="mt-4 rounded-xl border border-slate-200 px-4 py-3"
      />
      {submitted && errors.title ? <Text className="mt-1 text-xs text-red-500">{errors.title}</Text> : null}

      <TextInput
        placeholder="Describe the item clearly"
        placeholderTextColor="#94a3b8"
        multiline
        value={description}
        onChangeText={setDescription}
        className="mt-3 rounded-xl border border-slate-200 px-4 py-3"
      />
      {submitted && errors.description ? <Text className="mt-1 text-xs text-red-500">{errors.description}</Text> : null}

      <TextInput
        placeholder="Location in SLIIT"
        placeholderTextColor="#94a3b8"
        value={location}
        onChangeText={setLocation}
        className="mt-3 rounded-xl border border-slate-200 px-4 py-3"
      />
      {submitted && errors.location ? <Text className="mt-1 text-xs text-red-500">{errors.location}</Text> : null}

      <Pressable
        onPress={() => setShowPicker(true)}
        className="mt-3 flex-row items-center rounded-xl border border-slate-200 px-4 py-3"
      >
        <CalendarClock size={18} color="#475569" />
        <Text className="ml-2 text-slate-700">{formatDateTime(eventDate)}</Text>
      </Pressable>
      {submitted && errors.eventAt ? <Text className="mt-1 text-xs text-red-500">{errors.eventAt}</Text> : null}

      {showPicker ? (
        <DateTimePicker value={eventDate} mode="datetime" onChange={handleDateChange} />
      ) : null}

      <Pressable
        onPress={handlePickImage}
        className="mt-3 flex-row items-center rounded-xl border border-slate-200 px-4 py-3"
      >
        <Camera size={18} color="#475569" />
        <Text className="ml-2 text-slate-700">Upload item image (optional)</Text>
      </Pressable>
      <Text className="mt-1 text-xs text-slate-500">
        Image is optional, but it improves matching confidence.
      </Text>

      <View className="mt-3 h-32 w-full overflow-hidden rounded-xl bg-slate-100">
        {imageUri ? (
          <Image source={{ uri: imageUri }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <ImageIcon size={24} color="#94a3b8" />
            <Text className="mt-2 text-xs text-slate-500">No image selected</Text>
          </View>
        )}
      </View>

      <Pressable onPress={handleSubmit} className="mt-5 items-center rounded-xl bg-blue-600 py-3">
        <Text className="font-semibold text-white">{submitLabel}</Text>
      </Pressable>
    </View>
  );
}
