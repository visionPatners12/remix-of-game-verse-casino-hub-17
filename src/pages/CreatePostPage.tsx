import React from 'react';
import { CreatePostPageUI } from '@/features/create-post';

export default function CreatePostPage() {
  return <CreatePostPageUI />;
}

/* 
================== BACKUP - ANCIENNE VERSION ==================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hash, Image, Plus } from 'lucide-react';
import { Layout } from "@/components/Layout";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PredictionMatchSelector } from '@/components/prediction/PredictionMatchSelector';
import { PredictionPreview } from '@/components/prediction/PredictionPreview';
import { ConfidenceSelector } from '@/components/tip/ConfidenceSelector';
import { ToggleSwitch } from '@/components/live/form/ToggleSwitch';
import { useHasTipsterProfile } from '@/hooks/useTipsterProfile';
import { usePostCreation, POST_TYPES, PostTypeSelector, MediaUploader, HashtagInput } from '@/features/posts';
import type { PredictionSelection } from '@/types';

export default function CreatePostPage() {
  // ... [ancien code conservé en backup]
}

================== FIN BACKUP ==================
*/
