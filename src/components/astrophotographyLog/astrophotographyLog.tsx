'use client';

import styles from './astrophotographyLog.module.scss';
import { Search, Sun, Cloud, List, Grid, ChevronDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { DataTable } from './dataTable';
import { useAppState } from '@/context/stateProvider';
import { sessionsColumnsDetailed } from '@/components/astrophotographyLog/columns/sessionsColumnsDetailed';
import { calibrationColumnsDetailed } from '@/components/astrophotographyLog/columns/calibrationColumnsDetailed';
import { sessionsColumnsSimple } from '@/components/astrophotographyLog/columns/sessionsColumnsSimple';
import { calibrationColumnsSimple } from '@/components/astrophotographyLog/columns/calibrationColumsSimple';
import { CalibrationFrame, ImagingSession } from '@/interfaces/state';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut
} from '../ui/context-menu';
import { DeleteSVG } from '@/public/svgs';
import { invoke } from '@tauri-apps/api/core';
import { toast } from '@/components/ui/use-toast';
import { useModal } from '@/context/modalProvider';
import NewImagingSession, { newImagingSession } from '@/components/modals/imagingSession/newImagingSession';
import { newCalibrationFrameSession } from '@/components/modals/calibrationRowEditor';
import SelectImagingFrames from '@/components/modals/selectImagingFrames';

interface SessionTableProps {
  setImages: Dispatch<SetStateAction<string[] | undefined>>;
}

export function AstrophotographyLog({ setImages }: SessionTableProps) {
  const { appState } = useAppState();

  const [showCalibration, setShowCalibration] = useState(false);
  const [isDetailedView, setIsDetailedView] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  const [value, setValue] = useState<any>(undefined);
  const [session, setSession] = useState<ImagingSession | undefined>(undefined);
  const [calibration, setCalibration] = useState<CalibrationFrame | undefined>(
    undefined
  );

  useEffect(() => {
    setSession(undefined);
    setCalibration(undefined);

    if (showCalibration) {
      setCalibration(value);
      setImages(undefined);
    } else {
      setSession(value);

      if (value) {
        invoke<string[]>('get_image_frames_path', { id: value?.id })
          .then((images) => setImages(images))
          .catch((err) =>
            toast({
              variant: 'destructive',
              description: 'Failed to open Image: ' + err
            })
          );
      }
    }
  }, [value]);

  useEffect(() => {
    setValue(undefined);
  }, [showCalibration]);

  const handleToggleChange = (checked: boolean) => {
    setShowCalibration(checked);
  };

  function renderTable() {
    if (showCalibration) {
      if (isDetailedView) {
        return (
          <DataTable
            columns={calibrationColumnsDetailed}
            data={appState.table_data.calibration}
            globalFilter={globalFilter}
            setValue={setValue}
          >
            <CalibrationContextMenu calibration={calibration} />
          </DataTable>
        );
      }

      return (
        <DataTable
          columns={calibrationColumnsSimple}
          data={appState.table_data.calibration}
          globalFilter={globalFilter}
          setValue={setValue}
        >
          <CalibrationContextMenu calibration={calibration} />
        </DataTable>
      );
    }

    if (isDetailedView) {
      return (
        <DataTable
          columns={sessionsColumnsDetailed}
          data={appState.table_data.sessions}
          globalFilter={globalFilter}
          setValue={setValue}
          columnSort={[{ id: "date", desc: true }]}
        >
          <ImagingSessionContextMenu session={session} />
        </DataTable>
      );
    }

    return (
      <DataTable
        columns={sessionsColumnsSimple}
        data={appState.table_data.sessions}
        globalFilter={globalFilter}
        setValue={setValue}
        columnSort={[{ id: "date", desc: true }, { id: "target", desc: true }]}
      >
        <ImagingSessionContextMenu session={session} />
      </DataTable>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="bg-card border-border flex-1">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-8 bg-secondary border-input text-secondary-foreground"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="calibration-mode"
                checked={showCalibration}
                onCheckedChange={handleToggleChange}
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="calibration-mode" className="text-foreground">
                {showCalibration ? 'Calibration Frames' : 'Imaging Sessions'}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              {isDetailedView && !showCalibration && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      Columns <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {/* TODO */}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailedView(false)}
                className={`bg-secondary text-secondary-foreground hover:bg-secondary/80 ${!isDetailedView ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <Grid className="h-4 w-4 mr-2" />
                Simple View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailedView(true)}
                className={`bg-secondary text-secondary-foreground hover:bg-secondary/80 ${isDetailedView ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <List className="h-4 w-4 mr-2" />
                Detailed View
              </Button>
            </div>
          </div>

          {renderTable()}
        </CardContent>
      </Card>

      {session && !showCalibration && !isDetailedView && (
        <Card className="mt-4 bg-card border-border">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Session Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="flex items-center gap-2 mb-1 text-foreground">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Gain:</span> {session?.gain}
                </p>
                <p className="flex items-center gap-2 text-foreground">
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Conditions:</span>
                  {'Seeing: ' + session?.average_seeing + ', Clouds: ' + session?.average_cloud_cover + ', Moon: ' + session?.average_moon + '%'}
                </p>
              </div>
              <div>
                <p className="mb-1 text-foreground">
                  <span className="font-medium">Notes:</span> {session?.notes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ImagingSessionContextMenu({
                                     session
                                   }: {
  session: ImagingSession | undefined;
}) {
  const { openModal } = useModal();
  const { appState } = useAppState();

  return (
    <ContextMenuContent className="w-64">
      <ContextMenuItem inset disabled={!session} onClick={() =>
        invoke('open_imaging_session', { id: session?.id })
          .catch((error) => {
            toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: 'Error: ' + error
            });
          })
      }>
        Open...
        <ContextMenuShortcut>⌘]</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem
        inset
        disabled={!session}
        onClick={() => toast({
          variant: 'destructive',
          title: 'Feature not implemented!',
          description: 'This feature will be available soon.'
        })}
      >
        Edit...
      </ContextMenuItem>
      <ContextMenuItem
        inset
        disabled={!session}
        className={styles.delete}
        onClick={() => toast({
          variant: 'destructive',
          title: 'Feature not implemented!',
          description: 'This feature will be available soon.'
        })}
      >
        Delete
        <ContextMenuShortcut>
          <DeleteSVG />
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        inset
        onClick={() => newImagingSession({
          appState,
          open: () => openModal(<NewImagingSession />),
        })}
      >
        Add new Session...
      </ContextMenuItem>
    </ContextMenuContent>
  );
}

function CalibrationContextMenu({
                                  calibration
                                }: {
  calibration: CalibrationFrame | undefined;
}) {
  const { openModal } = useModal();
  const { appState } = useAppState();

  return (
    <ContextMenuContent className="w-64">
      <ContextMenuItem
        inset
        disabled={!calibration}
        onClick={() => toast({
          variant: 'destructive',
          title: 'Feature not implemented!',
          description: 'This feature will be available soon.'
        })}
      >
        Open...
      </ContextMenuItem>
      <ContextMenuItem
        inset
        disabled={!calibration}
        onClick={() => toast({
          variant: 'destructive',
          title: 'Feature not implemented!',
          description: 'This feature will be available soon.'
        })}
      >
        Edit...
      </ContextMenuItem>
      <ContextMenuItem
        inset
        disabled={!calibration}
        className={styles.delete}
        onClick={() => toast({
          variant: 'destructive',
          title: 'Feature not implemented!',
          description: 'This feature will be available soon.'
        })}
      >
        Delete
        <ContextMenuShortcut>
          <DeleteSVG />
        </ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        inset
        onClick={() => newCalibrationFrameSession({
          appState,
          open: () => openModal(<SelectImagingFrames />),
        })}
      >Add new Frames...
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
