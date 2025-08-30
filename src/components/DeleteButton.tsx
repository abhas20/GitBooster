'use client';
import React, { useTransition } from 'react'
import { Button } from './ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import deleteRepo from '@/actions/delete_repo';

function DeleteButton( {repoId,onDelete}:{repoId:string,onDelete:()=>void} ) {
    const [isPending, startTransition] = useTransition();

    const handleDeleteRepo= ()=>{
        startTransition(async()=>{
            try {
                
                const {success}=await deleteRepo(repoId);
                if(success){
                    // router.refresh();
                    toast.success("Repo deleted successfully",{
                        duration:2000,
                        position:"top-center",
                    })
                }
                else{
                    toast.error("Error deleting repo. Please try again.",{
                        duration:2000,
                        position:"top-center",
                    });
                }


            } catch (error) {
                console.log(error);
                toast.error("Error deleting repo. Please try again.",{
                    position:"top-center",
                    duration:2000,
                });
            }
        })
    }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive">
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure to delete this Repo from your recents</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this repo and remove all the analyses associated with it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteRepo}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-24">
            {isPending ? <Loader2 className="animate-spin" /> : "DELETE"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteButton
