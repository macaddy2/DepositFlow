'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Video,
    Camera,
    Upload,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    FileVideo,
    ImageIcon,
    Lightbulb,
    Send,
    Home,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ROOM_TYPES, type RoomTypeId } from '@/lib/constants'

interface RoomFile {
    file: File
    preview: string
    type: 'video' | 'image'
}

interface RoomUploadState {
    files: RoomFile[]
    uploaded: boolean
}

type RoomUploads = Record<RoomTypeId, RoomUploadState>

const ROOM_ICONS: Record<RoomTypeId, React.ReactNode> = {
    kitchen: <Home className="w-5 h-5" />,
    bathroom: <Home className="w-5 h-5" />,
    bedroom: <Home className="w-5 h-5" />,
    living_room: <Home className="w-5 h-5" />,
    hallway: <Home className="w-5 h-5" />,
    exterior: <Home className="w-5 h-5" />,
}

function createInitialState(): RoomUploads {
    const state = {} as RoomUploads
    for (const room of ROOM_TYPES) {
        state[room.id] = { files: [], uploaded: false }
    }
    return state
}

export default function VideoWalkthroughPage() {
    const [rooms, setRooms] = useState<RoomUploads>(createInitialState)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

    const completedRooms = ROOM_TYPES.filter(r => rooms[r.id].files.length > 0)
    const completedCount = completedRooms.length
    const progressPercent = Math.round((completedCount / ROOM_TYPES.length) * 100)
    const canSubmit = completedCount >= 3

    const handleFileSelect = useCallback((roomId: RoomTypeId, e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files
        if (!selectedFiles || selectedFiles.length === 0) return

        const newFiles: RoomFile[] = Array.from(selectedFiles).map(file => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video/') ? 'video' : 'image',
        }))

        setRooms(prev => ({
            ...prev,
            [roomId]: {
                ...prev[roomId],
                files: [...prev[roomId].files, ...newFiles],
                uploaded: false,
            },
        }))

        // Reset the input so the same file can be selected again
        e.target.value = ''
    }, [])

    const removeFile = useCallback((roomId: RoomTypeId, fileIndex: number) => {
        setRooms(prev => {
            const room = prev[roomId]
            const removedFile = room.files[fileIndex]
            if (removedFile) {
                URL.revokeObjectURL(removedFile.preview)
            }
            return {
                ...prev,
                [roomId]: {
                    ...prev[roomId],
                    files: room.files.filter((_, i) => i !== fileIndex),
                    uploaded: false,
                },
            }
        })
    }, [])

    const handleSubmit = async () => {
        setSubmitting(true)

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Mark all rooms with files as uploaded
        setRooms(prev => {
            const updated = { ...prev }
            for (const room of ROOM_TYPES) {
                if (updated[room.id].files.length > 0) {
                    updated[room.id] = { ...updated[room.id], uploaded: true }
                }
            }
            return updated
        })

        setSubmitting(false)
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="border-0 shadow-xl overflow-hidden">
                    <CardContent className="p-8">
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-[#028090] to-[#02C39A] flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Walkthrough Submitted</h1>
                                <p className="text-slate-500 mt-2">
                                    Your video walkthrough has been submitted successfully. We&apos;ll review
                                    your {completedCount} room{completedCount !== 1 ? 's' : ''} and get back to you shortly.
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                {ROOM_TYPES.filter(r => rooms[r.id].files.length > 0).map(room => (
                                    <div key={room.id} className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">{room.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400">
                                                {rooms[room.id].files.length} file{rooms[room.id].files.length !== 1 ? 's' : ''}
                                            </span>
                                            <CheckCircle2 className="w-4 h-4 text-[#02C39A]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link href="/dashboard">
                                <Button className="w-full h-12 bg-gradient-to-r from-[#028090] to-[#02C39A] hover:from-[#02a5b5] hover:to-[#04d9ad] text-white font-bold shadow-lg shadow-[#028090]/25">
                                    Back to Dashboard
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Back Button */}
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 group transition-colors"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Dashboard</span>
            </Link>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#028090] to-[#02C39A] flex items-center justify-center">
                        <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Video Walkthrough</h1>
                        <p className="text-slate-500 text-sm">Record a room-by-room walkthrough of your property</p>
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            <Card className="border-0 shadow-lg mb-6 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-[#028090]" />
                            <span className="text-sm font-semibold text-slate-700">Upload Progress</span>
                        </div>
                        <Badge
                            variant="secondary"
                            className={`${
                                completedCount >= 3
                                    ? 'bg-[#02C39A]/10 text-[#028090] border-[#02C39A]/30'
                                    : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {completedCount} / {ROOM_TYPES.length} rooms
                        </Badge>
                    </div>
                    <Progress
                        value={progressPercent}
                        className="h-3 bg-slate-100"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                        {completedCount < 3
                            ? `Upload at least ${3 - completedCount} more room${3 - completedCount !== 1 ? 's' : ''} to submit`
                            : 'You can submit your walkthrough now, or continue adding rooms'}
                    </p>
                </CardContent>
            </Card>

            {/* Tips Alert */}
            <Alert className="mb-6 bg-[#028090]/5 border-[#028090]/20">
                <Lightbulb className="h-4 w-4 text-[#028090]" />
                <AlertDescription className="text-[#1A2332]">
                    Walk slowly through each room, capturing walls, floors, and any existing damage.
                    Good lighting helps us assess your property accurately.
                </AlertDescription>
            </Alert>

            {/* Room Cards */}
            <div className="space-y-4">
                {ROOM_TYPES.map(room => {
                    const roomState = rooms[room.id]
                    const hasFiles = roomState.files.length > 0
                    const isUploaded = roomState.uploaded

                    return (
                        <Card
                            key={room.id}
                            className={`border-0 shadow-md overflow-hidden transition-all duration-200 ${
                                isUploaded
                                    ? 'ring-2 ring-[#02C39A]/50'
                                    : hasFiles
                                    ? 'ring-2 ring-[#028090]/30'
                                    : ''
                            }`}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                isUploaded
                                                    ? 'bg-[#02C39A]/10 text-[#02C39A]'
                                                    : hasFiles
                                                    ? 'bg-[#028090]/10 text-[#028090]'
                                                    : 'bg-slate-100 text-slate-400'
                                            }`}
                                        >
                                            {ROOM_ICONS[room.id]}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{room.label}</h3>
                                            <p className="text-xs text-slate-400">{room.tips}</p>
                                        </div>
                                    </div>
                                    {isUploaded && (
                                        <Badge className="bg-[#02C39A]/10 text-[#02C39A] border-[#02C39A]/30">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Uploaded
                                        </Badge>
                                    )}
                                    {hasFiles && !isUploaded && (
                                        <Badge variant="secondary" className="bg-[#028090]/10 text-[#028090]">
                                            {roomState.files.length} file{roomState.files.length !== 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                </div>

                                {/* File Previews */}
                                {hasFiles && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {roomState.files.map((roomFile, idx) => (
                                            <div
                                                key={idx}
                                                className="relative group w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200"
                                            >
                                                {roomFile.type === 'image' ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={roomFile.preview}
                                                        alt={`${room.label} ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-[#1A2332]">
                                                        <FileVideo className="w-6 h-6 text-[#02C39A]" />
                                                    </div>
                                                )}
                                                {!isUploaded && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(room.id, idx)}
                                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                    >
                                                        <X className="w-4 h-4 text-white" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload Button */}
                                {!isUploaded && (
                                    <div>
                                        <input
                                            ref={el => { fileInputRefs.current[room.id] = el }}
                                            type="file"
                                            accept="video/*,image/*"
                                            multiple
                                            onChange={e => handleFileSelect(room.id, e)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRefs.current[room.id]?.click()}
                                            className="w-full border-2 border-dashed border-slate-200 hover:border-[#028090]/40 hover:bg-[#028090]/5 rounded-lg p-3 transition-all duration-200 group"
                                        >
                                            <div className="flex items-center justify-center gap-2 text-slate-400 group-hover:text-[#028090]">
                                                <Upload className="w-4 h-4" />
                                                <span className="text-sm font-medium">
                                                    {hasFiles ? 'Add more files' : 'Upload video or photos'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-300 mt-1">
                                                Accepts video and image files
                                            </p>
                                        </button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Submit Button */}
            <div className="mt-8 mb-12">
                {canSubmit && (
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full h-14 bg-gradient-to-r from-[#028090] to-[#02C39A] hover:from-[#02a5b5] hover:to-[#04d9ad] text-white font-bold text-lg shadow-lg shadow-[#028090]/25 transition-all duration-200"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Uploading walkthrough...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 mr-2" />
                                Submit Walkthrough ({completedCount} room{completedCount !== 1 ? 's' : ''})
                            </>
                        )}
                    </Button>
                )}
                {!canSubmit && (
                    <div className="text-center">
                        <Button
                            disabled
                            className="w-full h-14 bg-slate-200 text-slate-400 font-bold text-lg cursor-not-allowed"
                        >
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Upload at least 3 rooms to submit
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
