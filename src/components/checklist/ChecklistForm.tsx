'use client'

import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'


interface RecebimentoOption {
  id: string;
  os_formatado: string;
}

interface ChecklistFormProps {
  recebimentoId: string
  setRecebimentoId: React.Dispatch<React.SetStateAction<string>>
  recebimentosOptions:  RecebimentoOption[]
  loading?: boolean
  onSave: (recebimentoId: string, dataInicio: string, dataFim: string) => void
  onCancel?: () => void
}

// Schema de validação das datas e recebimentoId
const createSchema = (recebimentosOptions: string[], recebimentoIdStr: string) =>
  z
    .object({
      recebimentoId: z
        .string()
        .nonempty('Recebimento ID é obrigatório')
        .refine(
          (val) =>
            recebimentosOptions.length
              ? recebimentosOptions.includes(val)
              : val === recebimentoIdStr,
          { message: 'Recebimento ID inválido' }
        ),
      dataInicio: z.date({ required_error: 'Data início é obrigatória' }),
      dataFim: z.date({ required_error: 'Data fim é obrigatória' }),
    })
    .refine((data) => data.dataFim >= data.dataInicio, {
      message: 'Data fim deve ser igual ou maior que a data início',
      path: ['dataFim'],
    })

type FormData = z.infer<ReturnType<typeof createSchema>>

export default function ChecklistForm({
  recebimentoId,
  recebimentosOptions,
  loading,
  onSave,
  onCancel,
  setRecebimentoId,
}: ChecklistFormProps & { setRecebimentoId: React.Dispatch<React.SetStateAction<string>> }) {
  const recebimentoIdStr = String(recebimentoId)

  const schema = createSchema(recebimentosOptions, recebimentoIdStr)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
     watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      recebimentoId: recebimentoIdStr,
      dataInicio: new Date(),
      dataFim: new Date(),
    },
  })

  // Mantém recebimentoId sincronizado com o form
  useEffect(() => {
    setValue('recebimentoId', recebimentoIdStr)
  }, [recebimentoIdStr, setValue])

  const onSubmit = (data: FormData) => {
    onSave(
      data.recebimentoId,
      data.dataInicio.toISOString(),
      data.dataFim.toISOString()
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6"
      noValidate
    >
      {/* RECEBIMENTO */}
      <div className="sm:col-span-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Numero Controle</label>
        <Controller
          name="recebimentoId"
          control={control}
          render={({ field }) => (
            <>
              <input
                {...field}
                list="recebimentos-list"
                placeholder="Recebimento ID"
                className="w-full p-2 border border-green-300 rounded-md"
                autoComplete="off"
                disabled={loading}
                aria-invalid={errors.recebimentoId ? 'true' : 'false'}
                onChange={(e) => {
                  field.onChange(e)
                  setRecebimentoId(e.target.value) // atualiza o state externo
                }}
              />
              <datalist id="recebimentos-list">
                {recebimentosOptions.map((r) => (
                  <option key={r.id} value={r.os_formatado} />
                ))}
              </datalist>
              {errors.recebimentoId && (
                <p className="text-red-600 font-semibold">{errors.recebimentoId.message}</p>
              )}
            </>
          )}
        />
      </div>

      {/* DATA INÍCIO */}
      <div className="sm:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
        <Controller
        name="dataInicio"
        control={control}
        render={({ field: { onChange, value, ref } }) => (
          <>
            <DatePicker
              selected={value}
              onChange={(date: Date | null) => onChange(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Selecione a data início"
              className="w-full p-2 border border-green-300 rounded-md"
              disabled={loading}
              ref={ref}
            />
            {errors.dataInicio && (
              <p className="text-red-600 font-semibold">{errors.dataInicio.message}</p>
            )}
          </>
        )}
      />

      </div>

      {/* DATA FIM */}
      <div className="sm:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
        <Controller
          name="dataFim"
          control={control}
          render={({ field: { onChange, value, ref } }) => (
            <>
              <DatePicker
                selected={value}
                onChange={(date: Date | null) => onChange(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecione a data fim"
                className="w-full p-2 border border-green-300 rounded-md"
                disabled={loading}
                minDate={watch('dataInicio')}
                ref={ref}
              />
              {errors.dataFim && (
                <p className="text-red-600 font-semibold">{errors.dataFim.message}</p>
              )}
            </>
          )}
        />
      </div>

      {/* BOTÕES */}
      <div className="flex-1 flex gap-3 items-center">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-50"
        >
          Filtrar
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            disabled={loading}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
