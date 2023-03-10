import React, { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import type { IText } from 'fabric/fabric-impl'
import { nanoid } from 'nanoid'
import useStore from '@/state/store'
import { ITextOptionsOverlay } from '@/types/board'
import { getImageScale } from '@/utils/getScale'
import { ToolsOverlay } from './tools'
import { ImageLoader } from '@/components/loaders'

const valuesTextBox: ITextOptionsOverlay = {
  isNew: true,
  fontSize: 22,
  fontFamily: 'Arial',
  textAlign: 'left',
  width: 110,
  top: 20,
  left: 10,
  padding: 1,
  editingBorderColor: 'white',
  cornerStyle: 'circle',
  cornerColor: 'white',
  cornerSize: 7,
  cornerStrokeColor: 'white',
  hasBorders: true,
  borderDashArray: [4],
  borderColor: 'red',
  text: 'Enter Text',
  fill: '#000000',
  fontWeight: 'normal',
  underline: false
}

export const TextOverlay = React.memo(function TextOverlay() {
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const [canvasFabric, setCanvasFabric] = useState<fabric.Canvas | undefined>(undefined)
  const textBoxObjects = useStore((state) => state.textBoxObjects)
  const addTextBoxObject = useStore((state) => state.addTextBoxObject)
  const onPointerOverlayDown = useStore((state) => state.onPointerOverlayDown)
  const onPointerOverlayUp = useStore((state) => state.onPointerOverlayUp)
  const onOverlayDragging = useStore((state) => state.onOverlayDragging)
  const selectedOverlay = useStore((state) => state.selectedOverlay)
  const isFirstRender = useStore((state) => state.isFirstRender)
  const setIsFirstRender = useStore((state) => state.setIsFirstRender)
  const isDragging = useStore((state) => state.isDragging)
  const onOverlayTyping = useStore((state) => state.onOverlayTyping)
  const isTyping = useStore((state) => state.isTyping)
  const currentUser = useStore((state) => state.liveblocks.room?.getSelf())
  const imageTransformedData = useStore((state) => state.imageTransformedData)
  const removeTextBoxObject = useStore((state) => state.removeTextBoxObject)
  const setStylesTextBoxObject = useStore((state) => state.setStylesTextBoxObject)
  const colorTextSelected = useStore((state) => state.colorTextSelected)
  const sizeTextSelected = useStore((state) => state.sizeTextSelected)
  const setIsLoadingImage = useStore((state) => state.setIsLoadingImage)
  const isLoadingImage = useStore((state) => state.isLoadingImage)
  const fontStyles = useStore((state) => state.fontStyles)

  useEffect(() => {
    if (!canvasEl.current) return
    if (!imageTransformedData) return

    const { url, width, height } = imageTransformedData
    const fabricCanvas = new fabric.Canvas(canvasEl.current)

    fabric.Image.fromURL(url, (fabricImg) => {
      const { scaleWidth, scaleHight } = getImageScale(width, height)
      // Set the dimensions of the canvas to fit the scaled image
      fabricCanvas.setDimensions({
        width: scaleWidth,
        height: scaleHight
      })

      // Add the image to the canvas and center it
      fabricImg.scaleToWidth(scaleWidth)
      fabricCanvas.setBackgroundImage(fabricImg, (img: any) => {})
      fabricCanvas.selection = false
      fabricCanvas.centerObject(fabricImg)
      setIsFirstRender(true)
      fabricCanvas
        .on('mouse:up', (event: any) => {
          if (event.target) {
            // console.log('up')
            onPointerOverlayUp()
          }
        })
        .on('mouse:down', (event: any) => {
          if (event.target) {
            const id = event.target.id
            onPointerOverlayDown(id)
          }
        })
        .on('object:moving', (event: any) => {
          const elemenTarget = event.target
          const { top, left } = elemenTarget
          if (elemenTarget) {
            onOverlayDragging({
              x: left,
              y: top
            })
          }
        })
        .on('text:changed', (event: any) => {
          const elmTarget = event.target
          if (elmTarget) {
            // console.log(elmTarget.text, elmTarget.getScaledWidth(), elmTarget.getScaledHeight())
            onOverlayTyping({
              text: elmTarget.text,
              width: elmTarget.getScaledWidth(),
              height: elmTarget.getScaledHeight()
            })
          }
        })
      setCanvasFabric(fabricCanvas)
      setIsLoadingImage(false)
    })
    return () => {
      fabricCanvas.dispose()
      setCanvasFabric(undefined)
    }
  }, [imageTransformedData])

  useEffect(() => {
    if (textBoxObjects.length === 0 || !canvasFabric) return
    if (isFirstRender) {
      // console.log('usEffect general objects')
      const { width, height } = imageTransformedData!
      const { scaleWidth, scaleHight } = getImageScale(width, height)
      textBoxObjects.forEach((obj: fabric.Object) => {
        if (obj.left! <= scaleWidth && obj.top! <= scaleHight) {
          const textBox = new fabric.IText('Enter Text', obj)
          textBox.setControlsVisibility({ mt: false, mb: false, mtr: false }) // controls textbox
          canvasFabric.add(textBox)
          canvasFabric.renderAll()
        }
      })
      setIsFirstRender(false)
    }
  }, [textBoxObjects, canvasFabric])

  useEffect(() => {
    if (!canvasFabric) return

    if (!isFirstRender) {
      // console.log(textBoxObjects.length, canvasFabric.getObjects().length)
      if (textBoxObjects.length < canvasFabric.getObjects().length) {
        // Removing all objects in canvas
        canvasFabric.remove(...canvasFabric.getObjects())
        // Put this code inside Custom Hook
        // Showing objects again
        const { width, height } = imageTransformedData!
        const { scaleWidth, scaleHight } = getImageScale(width, height)
        console.log(textBoxObjects)
        textBoxObjects.forEach((obj: fabric.Object) => {
          if (obj.left! <= scaleWidth && obj.top! <= scaleHight) {
            const textBox = new fabric.IText('Enter Text', obj)
            textBox.setControlsVisibility({ mt: false, mb: false, mtr: false }) // controls textbox
            canvasFabric.add(textBox)
            canvasFabric.renderAll()
          }
        })
        // End code inside Custom Hook
        return
      }
      const { owner, id } = textBoxObjects.at(-1) // Getting last overlay saved
      if (owner !== currentUser?.id) {
        valuesTextBox.id = id
        valuesTextBox.owner = owner
        const textBox = new fabric.IText('Enter Text', valuesTextBox)
        textBox.set('editable', true)
        textBox.setControlsVisibility({ mt: false, mb: false, mtr: false }) // controls textbox
        canvasFabric.add(textBox)
        canvasFabric.renderAll()
      }
    }
  }, [textBoxObjects.length, canvasFabric])

  useEffect(() => {
    if (!canvasFabric) return
    if (!selectedOverlay) return

    if (isDragging) {
      const overlayObject = canvasFabric
        .getObjects()
        .find((obj: any) => obj.id === selectedOverlay) as IText
      if (overlayObject) {
        const overlaySelectedData = textBoxObjects.find(
          (txtObject: any) => txtObject.id === selectedOverlay
        )
        if (overlaySelectedData) {
          const { top, left } = overlaySelectedData

          overlayObject.set('top', top)
          overlayObject.set('left', left)
          overlayObject.set('editable', true)
          canvasFabric._activeObject = overlayObject
          canvasFabric.renderAll()
        }
      }
    }

    if (isTyping) {
      const overlayObject = canvasFabric
        .getObjects()
        .find((obj: any) => obj.id === selectedOverlay) as IText
      if (overlayObject) {
        const overlaySelectedData = textBoxObjects.find(
          (txtObject: any) => txtObject.id === selectedOverlay
        )
        if (overlaySelectedData) {
          const { width, height, text } = overlaySelectedData
          overlayObject.set('width', width)
          overlayObject.set('height', height)
          overlayObject.set('text', text)
          // canvasFabric._activeObject = overlayObject
          canvasFabric.renderAll()
        }
      }
    }
  }, [textBoxObjects, canvasFabric])

  const addText = () => {
    const idTextBox = nanoid(4)
    valuesTextBox.id = idTextBox
    valuesTextBox.owner = currentUser!.id
    const textBox = new fabric.IText('Enter Text', valuesTextBox)
    // hide rotation control
    textBox.setControlsVisibility({ mt: false, mb: false, mtr: false }) // controls textbox
    if (canvasFabric) {
      canvasFabric.add(textBox)
      canvasFabric._activeObject = textBox
      canvasFabric.renderAll()
    }
    addTextBoxObject(valuesTextBox)
    if (isFirstRender) setIsFirstRender(false)
  }

  const deleteText = () => {
    if (canvasFabric) {
      const activeOverlay = canvasFabric.getActiveObject()
      if (activeOverlay) {
        // canvasFabric.remove(activeOverlay)
        // @ts-ignore
        const { id } = activeOverlay
        removeTextBoxObject(id)
      }
    }
  }

  const changeColorOverlay = (value: string) => {
    // TODO: Add debounce when user change a style
    if (canvasFabric) {
      const activeOverlay = canvasFabric.getActiveObject() as IText
      if (!activeOverlay) return

      activeOverlay.set('fill', value)
      canvasFabric.renderAll()
      // @ts-ignore
      setStylesTextBoxObject(activeOverlay.id, fontStyles, value, sizeTextSelected)
    }
  }

  const changeStyleOverlay = (styles: any) => {
    if (canvasFabric) {
      const activeOverlay = canvasFabric.getActiveObject() as IText
      if (!activeOverlay) return
      activeOverlay.set(styles)
      canvasFabric.renderAll()
      // @ts-ignore
      setStylesTextBoxObject(activeOverlay.id, styles, colorTextSelected, sizeTextSelected)
      // canvasFabric.setActiveObject(activeOverlay)
      // activeOverlay.enterEditing()
    }
  }

  const changeSizeOverlay = (fontSize: number) => {
    // TODO: Add debounce when user types a number
    if (canvasFabric) {
      const activeOverlay = canvasFabric.getActiveObject() as IText
      if (!activeOverlay) return
      activeOverlay.set('fontSize', fontSize)
      canvasFabric.renderAll()
      // @ts-ignore
      setStylesTextBoxObject(activeOverlay.id, fontStyles, colorTextSelected, fontSize)
    }
  }

  return (
    <div className='flex flex-row justify-between items-center gap-6 w-full h-full'>
      <ToolsOverlay
        addText={addText}
        deleteText={deleteText}
        changeColorOverlay={changeColorOverlay}
        changeStyleOverlay={changeStyleOverlay}
        changeSizeOverlay={changeSizeOverlay}
      />
      <div className='border-1 min-h-[400px] min-w-[600px] max-h-[600px] max-w-[800px] flex justify-center items-center'>
        {isLoadingImage && <ImageLoader />}
        <canvas ref={canvasEl} />
      </div>
    </div>
  )
})
